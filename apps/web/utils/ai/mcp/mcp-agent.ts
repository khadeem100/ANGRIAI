import { stepCountIs, type ToolSet } from "ai";
import { createGenerateText } from "@/utils/llms";
import type { EmailAccountWithAI } from "@/utils/llms/types";
import { createMcpToolsForAgent } from "@/utils/ai/mcp/mcp-tools";
import { getModel } from "@/utils/llms/model";
import type { EmailForLLM } from "@/utils/types";
import { getEmailListPrompt, getUserInfoPrompt } from "@/utils/ai/helpers";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("mcp-agent");

type McpAgentOptions = {
  emailAccount: EmailAccountWithAI;
  messages: EmailForLLM[];
};

type McpAgentResponse = {
  response: string | null;
  getToolCalls: () => Array<{
    toolName: string;
    arguments: Record<string, unknown>;
    result: string;
  }>;
};

const NO_RELEVANT_INFO_FOUND = "NO_RELEVANT_INFO_FOUND";

async function runMcpAgent(
  options: McpAgentOptions,
  mcpTools: ToolSet,
): Promise<McpAgentResponse> {
  const { emailAccount, messages } = options;

  const system = `You are an operations assistant integrated with the user's App Store. The tools you have are exactly the ones the user has connected and enabled (e.g., Odoo, Stripe, Monday, Notion). Use ONLY the tools available to you to gather information and, when appropriate, take actions inside those third-party applications on the user's behalf.

OBJECTIVE:
- Understand the user request and recent email context.
- Identify relevant App Store tools and use them to complete the task end-to-end (read and/or write), when it is safe and appropriate.

CAPABILITIES & CONSTRAINTS:
- You can call tools that are present in your tool list. Tool names may be prefixed with an integration name only when there are naming conflicts. Never invent tools or parameters.
- Prefer safe, reversible actions. For write operations (create/update), proceed only when intent is explicit or strongly implied by the email/request (e.g., an inbound lead → create a CRM lead in Odoo).
- If a required field is missing, infer from the email. If still unknown, avoid destructive writes; prefer read/summarize or propose the minimal follow-up needed.
- If a needed integration is not available, do NOT claim you can do it. Briefly note that the user can connect it in the App Store and then continue with available options.

WORKFLOW:
1) Infer user intent from the latest messages.
2) Select the most relevant tool(s) from what is available.
3) Map inputs from the email/request to tool parameters. Examples for Odoo:
   - crm_lead_create: name, email_from, partner_name, description
   - project_task_create: name, project_id (optional), description (optional)
   - *_list tools: use sensible defaults for limit; add domain filters only when clear
4) Execute tool calls, chaining read → write if needed (e.g., list/find then create).
5) Produce a concise summary of what you found or did.

OUTPUT RULES:
- If you performed actions, summarize them with entity names/IDs when available.
- If you only retrieved information, summarize key findings concisely.
- If nothing relevant can be done or found, end with exactly "${NO_RELEVANT_INFO_FOUND}".
- Be concise and factual. Do not reveal internal tool names or parameters unless essential for clarity.`;

  const prompt = `${getUserInfoPrompt({ emailAccount })}

The last emails in the thread are:

<thread>
${getEmailListPrompt({ messages, messageMaxLength: 1000, maxMessages: 5 })}
</thread>`;

  const modelOptions = getModel(emailAccount.user, "economy");

  const generateText = createGenerateText({
    emailAccount,
    label: "MCP Agent",
    modelOptions,
  });

  const result = await generateText({
    ...modelOptions,
    tools: mcpTools,
    system,
    prompt,
    stopWhen: stepCountIs(10),
    onStepFinish: async ({ text, toolCalls }) => {
      logger.trace("Step finished", { text, toolCalls });
    },
  });

  const hasNoRelevantInfo = result.text.includes(NO_RELEVANT_INFO_FOUND);

  if (hasNoRelevantInfo) {
    logger.trace("No relevant information found", {
      explanation: result.text.replace(NO_RELEVANT_INFO_FOUND, "").trim(),
    });
  }

  return {
    response: hasNoRelevantInfo ? null : result.text,
    getToolCalls: () => {
      // Extract tool calls and results from all steps
      const allToolCallsWithResults = result.steps.flatMap((step) =>
        step.toolCalls.map((call) => {
          const toolResult = step.toolResults?.find(
            (result) => result.toolCallId === call.toolCallId,
          );
          return {
            toolName: call.toolName,
            arguments: call.input as Record<string, unknown>,
            result: toolResult?.output
              ? `${JSON.stringify(toolResult.output).slice(0, 200)}...`
              : "No result",
          };
        }),
      );
      return allToolCallsWithResults;
    },
  };
}

export async function mcpAgent(
  options: McpAgentOptions,
): Promise<McpAgentResponse | null> {
  const { emailAccount, messages } = options;

  if (!messages || messages.length === 0) return null;

  const { tools, cleanup } = await createMcpToolsForAgent(emailAccount.id);
  const hasTools = Object.keys(tools).length > 0;

  if (!hasTools) return null;

  try {
    return await runMcpAgent(options, tools as ToolSet);
  } finally {
    await cleanup();
  }
}
