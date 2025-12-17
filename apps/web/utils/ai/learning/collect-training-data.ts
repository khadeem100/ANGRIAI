import prisma from "@/utils/prisma";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("ai/learning");

interface CollectTrainingDataParams {
  emailAccountId: string;
  chatId?: string;
  conversationType: "chat" | "rule_execution" | "email_processing";
  userMessage: string;
  assistantResponse: string;
  toolCalls?: any;
  context?: any;
}

export async function collectTrainingData({
  emailAccountId,
  chatId,
  conversationType,
  userMessage,
  assistantResponse,
  toolCalls,
  context,
}: CollectTrainingDataParams) {
  try {
    // Check if user has given consent
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
      select: { aiLearningConsent: true },
    });

    if (!emailAccount?.aiLearningConsent) {
      logger.info("Skipping training data collection - no consent", {
        emailAccountId,
      });
      return null;
    }

    // Store the training data
    const trainingData = await prisma.aiTrainingData.create({
      data: {
        emailAccountId,
        chatId,
        conversationType,
        userMessage,
        assistantResponse,
        toolCalls: toolCalls ? JSON.parse(JSON.stringify(toolCalls)) : null,
        context: context ? JSON.parse(JSON.stringify(context)) : null,
        quality: "neutral", // Default quality, can be updated based on feedback
      },
    });

    logger.info("Training data collected", {
      id: trainingData.id,
      conversationType,
      emailAccountId,
    });

    // Trigger automatic sync to Ollama server (fire and forget)
    if (process.env.OLLAMA_AUTO_SYNC === "true") {
      import("./sync-to-ollama")
        .then(({ syncEmailAccountTrainingData }) => {
          syncEmailAccountTrainingData(emailAccountId);
        })
        .catch((err) =>
          logger.error("Auto-sync to Ollama failed", { error: err }),
        );
    }

    return trainingData;
  } catch (error) {
    logger.error("Error collecting training data", { error, emailAccountId });
    // Don't throw - training data collection shouldn't break the main flow
    return null;
  }
}

export async function updateTrainingDataQuality(
  trainingDataId: string,
  quality: "good" | "bad" | "neutral",
  feedback?: string,
) {
  try {
    await prisma.aiTrainingData.update({
      where: { id: trainingDataId },
      data: {
        quality,
        feedback,
      },
    });

    logger.info("Training data quality updated", { trainingDataId, quality });
  } catch (error) {
    logger.error("Error updating training data quality", {
      error,
      trainingDataId,
    });
  }
}
