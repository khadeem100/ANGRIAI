import prisma from "@/utils/prisma";
import { createScopedLogger } from "@/utils/logger";
import { env } from "@/env";

const logger = createScopedLogger("ai/learning/sync");

// Ollama server configuration
const OLLAMA_TRAINING_ENDPOINT =
  process.env.OLLAMA_TRAINING_ENDPOINT ||
  "http://65.108.60.66:5000/receive-training-data";
const SYNC_BATCH_SIZE = 100; // Send 100 conversations at a time

interface TrainingConversation {
  messages: Array<{
    role: string;
    content: string;
    tool_calls?: any;
  }>;
}

export async function syncTrainingDataToOllama() {
  try {
    logger.info("Starting training data sync to Ollama server...");

    // Find unsent training data
    const unsentData = await prisma.aiTrainingData.findMany({
      where: {
        // Add a field to track if data has been synced
        // For now, we'll sync all data created in the last hour
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
        quality: {
          not: "bad", // Don't send bad quality data
        },
      },
      take: SYNC_BATCH_SIZE,
      orderBy: {
        createdAt: "asc",
      },
    });

    if (unsentData.length === 0) {
      logger.info("No new training data to sync");
      return { success: true, count: 0 };
    }

    // Format data for Ollama
    const conversations: TrainingConversation[] = unsentData.map((item) => ({
      messages: [
        {
          role: "user",
          content: item.userMessage,
        },
        {
          role: "assistant",
          content: item.assistantResponse,
          ...(item.toolCalls ? { tool_calls: item.toolCalls } : {}),
        },
      ],
    }));

    // Send to Ollama server
    const response = await fetch(OLLAMA_TRAINING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add API key if configured
        ...(process.env.OLLAMA_TRAINING_API_KEY
          ? { "X-API-Key": process.env.OLLAMA_TRAINING_API_KEY }
          : {}),
      },
      body: JSON.stringify({ conversations }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama server responded with ${response.status}: ${await response.text()}`,
      );
    }

    const result = await response.json();

    logger.info("Training data synced successfully", {
      count: unsentData.length,
      filename: result.filename,
    });

    return {
      success: true,
      count: unsentData.length,
      filename: result.filename,
    };
  } catch (error) {
    logger.error("Failed to sync training data to Ollama", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Sync specific email account's data
export async function syncEmailAccountTrainingData(emailAccountId: string) {
  try {
    logger.info("Syncing training data for email account", { emailAccountId });

    const trainingData = await prisma.aiTrainingData.findMany({
      where: {
        emailAccountId,
        quality: { not: "bad" },
      },
      take: SYNC_BATCH_SIZE,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (trainingData.length === 0) {
      return { success: true, count: 0 };
    }

    const conversations: TrainingConversation[] = trainingData.map((item) => ({
      messages: [
        {
          role: "user",
          content: item.userMessage,
        },
        {
          role: "assistant",
          content: item.assistantResponse,
          ...(item.toolCalls ? { tool_calls: item.toolCalls } : {}),
        },
      ],
    }));

    const response = await fetch(OLLAMA_TRAINING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.OLLAMA_TRAINING_API_KEY
          ? { "X-API-Key": process.env.OLLAMA_TRAINING_API_KEY }
          : {}),
      },
      body: JSON.stringify({ conversations }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const result = await response.json();

    logger.info("Email account training data synced", {
      emailAccountId,
      count: trainingData.length,
    });

    return {
      success: true,
      count: trainingData.length,
      filename: result.filename,
    };
  } catch (error) {
    logger.error("Failed to sync email account training data", {
      error,
      emailAccountId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
