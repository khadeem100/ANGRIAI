import { generateObject } from "ai";
import { z } from "zod";
import { createScopedLogger } from "@/utils/logger";
import prisma from "@/utils/prisma";
import type { ModelMessage } from "ai";
import { getModel } from "@/utils/llms/model";
import { createGenerateObject } from "@/utils/llms";
import type { EmailAccountWithAI } from "@/utils/llms/types";

const logger = createScopedLogger("ai/learning");

export async function learnFromConversation({
  messages,
  emailAccountId,
  user,
}: {
  messages: ModelMessage[];
  emailAccountId: string;
  user: EmailAccountWithAI;
}) {
  try {
    // Only look at the last few messages to avoid re-processing everything and save tokens
    // But for a true "learn from conversation", we might want the whole context of the *current* session.
    // Assuming 'messages' contains the current session history.

    if (messages.length < 2) return; // Need at least some back and forth

    const modelOptions = getModel(user.user, "economy");
    const generate = createGenerateObject({
      emailAccount: user,
      label: "learning",
      modelOptions,
    });

    const result = await generate({
      model: modelOptions.model, // Satisfy TS, will be used/overridden by wrapper
      schema: z.object({
        facts: z.array(
          z.object({
            title: z
              .string()
              .describe("A short, descriptive title for the fact"),
            content: z.string().describe("The fact or preference to remember"),
          }),
        ),
      }),
      system: `You are a silent observer of a conversation between an AI assistant (Jenn) and a user.
Your goal is to extract important, long-term facts, preferences, and business details about the user that should be remembered for future interactions.
Ignore transient information (e.g., "draft a reply to this specific email", "what is the weather").
Focus on:
- User's business details (what they do, their role)
- Communication preferences (tone, style)
- Specific instructions they want repeated (e.g., "always archive newsletters")
- Relationships (key contacts, partners)

If there are no new important facts, return an empty list.`,
      messages,
    });

    const { facts } = result.object;

    if (facts.length === 0) return;

    logger.info(`Learned ${facts.length} new facts`, { facts });

    for (const fact of facts) {
      // Check for duplicates or update existing
      // We use the title as a pseudo-key, but content might change.
      // For now, we'll try to find an existing one with the same title or very similar content?
      // Simple approach: Upsert by title + emailAccountId if possible, but title isn't unique in schema (compound unique is [emailAccountId, title])

      try {
        await prisma.knowledge.upsert({
          where: {
            emailAccountId_title: {
              emailAccountId,
              title: fact.title,
            },
          },
          update: {
            content: fact.content,
          },
          create: {
            emailAccountId,
            title: fact.title,
            content: fact.content,
          },
        });
      } catch (err) {
        logger.warn("Failed to save learned fact", { fact, error: err });
      }
    }
  } catch (error) {
    logger.error("Error in learning process", { error });
    // Don't throw, as this is a background process
  }
}
