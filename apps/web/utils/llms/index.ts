import {
  APICallError,
  type ModelMessage,
  type Tool,
  type JSONValue,
  generateObject,
  generateText,
  RetryError,
  streamText,
  smoothStream,
  stepCountIs,
  type StreamTextOnFinishCallback,
  type StreamTextOnStepFinishCallback,
  NoObjectGeneratedError,
  TypeValidationError,
} from "ai";
import { jsonrepair } from "jsonrepair";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { saveAiUsage } from "@/utils/usage";
import type { EmailAccountWithAI, UserAIFields } from "@/utils/llms/types";
import { addUserErrorMessage, ErrorType } from "@/utils/error-messages";
import {
  captureException,
  isAnthropicInsufficientBalanceError,
  isAWSThrottlingError,
  isIncorrectOpenAIAPIKeyError,
  isInvalidOpenAIModelError,
  isOpenAIAPIKeyDeactivatedError,
  isOpenAIRetryError,
  isRateLimitError,
  isServiceUnavailableError,
} from "@/utils/error";
import { sleep } from "@/utils/sleep";
import { getModel, type ModelType } from "@/utils/llms/model";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("llms");

const MAX_LOG_LENGTH = 200;

const commonOptions: {
  experimental_telemetry: { isEnabled: boolean };
  headers?: Record<string, string>;
  providerOptions?: Record<string, Record<string, JSONValue>>;
} = { experimental_telemetry: { isEnabled: true } };

export function createGenerateText({
  emailAccount,
  label,
  modelOptions,
}: {
  emailAccount: Pick<EmailAccountWithAI, "email" | "id">;
  label: string;
  modelOptions: ReturnType<typeof getModel>;
}): typeof generateText {
  return async (...args) => {
    const [options, ...restArgs] = args;

    const generate = async (model: LanguageModelV2) => {
      logger.trace("Generating text", {
        label,
        system: options.system?.slice(0, MAX_LOG_LENGTH),
        prompt: options.prompt?.slice(0, MAX_LOG_LENGTH),
      });

      const result = await generateText(
        {
          ...options,
          ...commonOptions,
          model,
        },
        ...restArgs,
      );

      if (result.usage) {
        await saveAiUsage({
          email: emailAccount.email,
          usage: result.usage,
          provider: modelOptions.provider,
          model: modelOptions.modelName,
          label,
        });
      }

      if (args[0].tools) {
        const toolCallInput = result.toolCalls?.[0]?.input;
        logger.trace("Result", {
          label,
          result: toolCallInput,
        });
      }

      return result;
    };

    // Construct execution plan: Primary -> Backup (legacy) -> Fallbacks
    const executionPlan: { model: LanguageModelV2; name: string; provider: string }[] = [
      {
        model: modelOptions.model,
        name: modelOptions.modelName,
        provider: modelOptions.provider,
      },
    ];

    if (modelOptions.backupModel) {
      // Legacy backup model support - assuming OpenRouter/Anthropic if checking legacy code
      executionPlan.push({
        model: modelOptions.backupModel,
        name: "backup-model",
        provider: "unknown",
      });
    }

    if (modelOptions.fallbacks && modelOptions.fallbacks.length > 0) {
      for (const fallback of modelOptions.fallbacks) {
        executionPlan.push({
          model: fallback.model,
          name: fallback.modelName,
          provider: fallback.provider,
        });
      }
    }

    let lastError: unknown;

    for (let i = 0; i < executionPlan.length; i++) {
      const plan = executionPlan[i];
      try {
        if (i > 0) {
          logger.info("Falling back to next model", {
            label,
            previousError: lastError,
            nextModel: plan.name,
            nextProvider: plan.provider,
          });
        }
        return await generate(plan.model);
      } catch (error) {
        lastError = error;
        // Only fallback on specific errors
        if (
          isRateLimitError(error) ||
          isServiceUnavailableError(error) ||
          isAWSThrottlingError(error)
        ) {
          // Continue loop to next fallback
          continue;
        }

        // For other errors (validation, invalid key, etc), fail fast
        await handleError(
          error,
          emailAccount.email,
          emailAccount.id,
          label,
          plan.name,
        );
        throw error;
      }
    }

    // If we exhausted all options
    if (lastError) {
      await handleError(
        lastError,
        emailAccount.email,
        emailAccount.id,
        label,
        "all-models-exhausted",
      );
      throw lastError;
    }
    
    throw new Error("Unexpected error: No models available in execution plan");
  };
}

export function createGenerateObject({
  emailAccount,
  label,
  modelOptions,
}: {
  emailAccount: Pick<EmailAccountWithAI, "email" | "id">;
  label: string;
  modelOptions: ReturnType<typeof getModel>;
}): typeof generateObject {
  return async (...args) => {
    // Construct execution plan: Primary -> Backup (legacy) -> Fallbacks
    const executionPlan: { model: LanguageModelV2; name: string; provider: string }[] = [
      {
        model: modelOptions.model,
        name: modelOptions.modelName,
        provider: modelOptions.provider,
      },
    ];

    if (modelOptions.backupModel) {
      executionPlan.push({
        model: modelOptions.backupModel,
        name: "backup-model",
        provider: "unknown",
      });
    }

    if (modelOptions.fallbacks && modelOptions.fallbacks.length > 0) {
      for (const fallback of modelOptions.fallbacks) {
        executionPlan.push({
          model: fallback.model,
          name: fallback.modelName,
          provider: fallback.provider,
        });
      }
    }

    const maxRetries = 2;
    let lastError: unknown;

    // Loop through available models
    for (let i = 0; i < executionPlan.length; i++) {
      const plan = executionPlan[i];
      
      // If falling back to a new model
      if (i > 0) {
        logger.info("Falling back to next model for generateObject", {
          label,
          previousError: lastError,
          nextModel: plan.name,
          nextProvider: plan.provider,
        });
      }

      // Retry loop for VALIDATION errors on the SAME model
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const [options, ...restArgs] = args;

          if (attempt > 0) {
            logger.info("Retrying generateObject after validation error", {
              label,
              attempt,
              maxRetries,
              model: plan.name,
            });
          }

          logger.trace("Generating object", {
            label,
            system: options.system?.slice(0, MAX_LOG_LENGTH),
            prompt: options.prompt?.slice(0, MAX_LOG_LENGTH),
            attempt,
            model: plan.name,
          });

          if (
            !options.system?.includes("JSON") &&
            typeof options.prompt === "string" &&
            !options.prompt?.includes("JSON")
          ) {
            logger.warn("Missing JSON in prompt", { label });
          }

          const result = await generateObject(
            {
              experimental_repairText: async ({ text }) => {
                logger.info("Repairing text", { label, attempt });
                const fixed = jsonrepair(text);
                return fixed;
              },
              ...options,
              ...commonOptions,
              model: plan.model, // Use current plan model
            },
            ...restArgs,
          );

          if (result.usage) {
            await saveAiUsage({
              email: emailAccount.email,
              usage: result.usage,
              provider: plan.provider,
              model: plan.name,
              label,
            });
          }

          logger.trace("Generated object", {
            label,
            result: result.object,
            attempt,
          });

          return result;
        } catch (error) {
          lastError = error;

          // 1. Check for Rate Limit / Quota errors -> Break inner loop to try NEXT MODEL
          if (
            isRateLimitError(error) ||
            isServiceUnavailableError(error) ||
            isAWSThrottlingError(error)
          ) {
            logger.warn("Rate limit/quota error, switching model", { error, model: plan.name });
            break; // Break attempt loop, continue to next model in outer loop
          }

          // 2. Check for Validation errors -> Continue inner loop (Retry SAME model)
          const isValidationError =
            NoObjectGeneratedError.isInstance(error) ||
            TypeValidationError.isInstance(error);

          if (isValidationError && attempt < maxRetries) {
            logger.warn("Validation error, will retry same model", {
              label,
              attempt,
              maxRetries,
              errorName: error.name,
              errorMessage: error.message,
            });

            // Wait a bit before retrying
            await sleep(1000);
            continue; // Retry same model
          }

          // 3. Other errors -> Fail fast (don't retry same model, don't fallback)
          // UNLESS we decide other errors should also trigger fallback? 
          // generally "Invalid API Key" etc should probably fail fast.
          await handleError(
            error,
            emailAccount.email,
            emailAccount.id,
            label,
            plan.name,
          );
          throw error;
        }
      }
    }

    // If we exhausted all options
    if (lastError) {
      await handleError(
        lastError,
        emailAccount.email,
        emailAccount.id,
        label,
        "all-models-exhausted",
      );
      throw lastError;
    }

    throw new Error("Unexpected error: No models available in execution plan");
  };
}

export async function chatCompletionStream({
  userAi,
  modelType,
  messages,
  tools,
  maxSteps,
  userEmail,
  usageLabel: label,
  onFinish,
  onStepFinish,
}: {
  userAi: UserAIFields;
  modelType?: ModelType;
  messages: ModelMessage[];
  tools?: Record<string, Tool>;
  maxSteps?: number;
  userEmail: string;
  usageLabel: string;
  onFinish?: StreamTextOnFinishCallback<Record<string, Tool>>;
  onStepFinish?: StreamTextOnStepFinishCallback<Record<string, Tool>>;
}) {
  const modelOptions = getModel(
    userAi,
    modelType,
  );

  // Construct execution plan: Primary -> Backup -> Fallbacks
  const executionPlan: { model: LanguageModelV2; name: string; provider: string }[] = [
    {
      model: modelOptions.model,
      name: modelOptions.modelName,
      provider: modelOptions.provider,
    },
  ];

  if (modelOptions.backupModel) {
    executionPlan.push({
      model: modelOptions.backupModel,
      name: "backup-model",
      provider: "unknown",
    });
  }

  if (modelOptions.fallbacks && modelOptions.fallbacks.length > 0) {
    for (const fallback of modelOptions.fallbacks) {
      executionPlan.push({
        model: fallback.model,
        name: fallback.modelName,
        provider: fallback.provider,
      });
    }
  }

  let lastError: unknown;

  for (let i = 0; i < executionPlan.length; i++) {
    const plan = executionPlan[i];
    
    try {
      if (i > 0) {
        logger.info("Falling back to next model for chatCompletionStream", {
          label,
          previousError: lastError,
          nextModel: plan.name,
          nextProvider: plan.provider,
        });
      }

      const result = streamText({
        model: plan.model,
        messages,
        tools,
        stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
        providerOptions: modelOptions.providerOptions, // Use original provider options (might need adjustment per model, but usually fine)
        ...commonOptions,
        experimental_transform: smoothStream({ chunking: "word" }),
        onStepFinish,
        onFinish: async (result) => {
          const usagePromise = saveAiUsage({
            email: userEmail,
            provider: plan.provider,
            model: plan.name,
            usage: result.usage,
            label,
          });

          const finishPromise = onFinish?.(result);

          try {
            await Promise.all([usagePromise, finishPromise]);
          } catch (error) {
            logger.error("Error in onFinish callback", {
              label,
              userEmail,
              error,
            });
            logger.trace("Result", { result });
            captureException(
              error,
              {
                extra: { label },
              },
              userEmail,
            );
          }
        },
        onError: (error) => {
          logger.error("Error in chat completion stream", {
            label,
            userEmail,
            error,
            model: plan.name,
          });
          // We can't really fallback here since the stream has started
          captureException(
            error,
            {
              extra: { label },
            },
            userEmail,
          );
        },
      });

      return result;
    } catch (error) {
      lastError = error;
      
      // Only fallback on specific errors for the initial call
      if (
        isRateLimitError(error) ||
        isServiceUnavailableError(error) ||
        isAWSThrottlingError(error)
      ) {
        continue;
      }

      throw error;
    }
  }

  if (lastError) {
    throw lastError;
  }
  
  throw new Error("Unexpected error: No models available in execution plan");
}

async function handleError(
  error: unknown,
  userEmail: string,
  emailAccountId: string,
  label: string,
  modelName: string,
) {
  logger.error("Error in LLM call", {
    error,
    userEmail,
    emailAccountId,
    label,
    modelName,
  });

  if (APICallError.isInstance(error)) {
    if (isIncorrectOpenAIAPIKeyError(error)) {
      return await addUserErrorMessage(
        userEmail,
        ErrorType.INCORRECT_OPENAI_API_KEY,
        error.message,
      );
    }

    if (isInvalidOpenAIModelError(error)) {
      return await addUserErrorMessage(
        userEmail,
        ErrorType.INVALID_OPENAI_MODEL,
        error.message,
      );
    }

    if (isOpenAIAPIKeyDeactivatedError(error)) {
      return await addUserErrorMessage(
        userEmail,
        ErrorType.OPENAI_API_KEY_DEACTIVATED,
        error.message,
      );
    }

    if (RetryError.isInstance(error) && isOpenAIRetryError(error)) {
      return await addUserErrorMessage(
        userEmail,
        ErrorType.OPENAI_RETRY_ERROR,
        error.message,
      );
    }

    if (isAnthropicInsufficientBalanceError(error)) {
      return await addUserErrorMessage(
        userEmail,
        ErrorType.ANTHROPIC_INSUFFICIENT_BALANCE,
        error.message,
      );
    }
  }
}

// NOTE: Think we can just switch this out for p-retry that we already use in the project
export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    retryIf,
    maxRetries,
    delayMs,
  }: {
    retryIf: (error: unknown) => boolean;
    maxRetries: number;
    delayMs: number;
  },
): Promise<T> {
  let attempts = 0;
  let lastError: unknown;

  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      lastError = error;

      if (retryIf(error)) {
        logger.warn("Operation failed. Retrying...", {
          attempts,
          error,
        });

        if (attempts < maxRetries) {
          await sleep(delayMs);
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError;
}
