import { NextResponse } from "next/server";
import { syncTrainingDataToOllama } from "@/utils/ai/learning/sync-to-ollama";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("cron/sync-training-data");

// This endpoint should be called by a cron job (e.g., Vercel Cron, Upstash QStash)
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Starting scheduled training data sync");

    const result = await syncTrainingDataToOllama();

    if (result.success) {
      logger.info("Cron sync completed successfully", {
        count: result.count,
      });

      return NextResponse.json({
        success: true,
        message: `Synced ${result.count} conversations`,
        ...result,
      });
    } else {
      logger.error("Cron sync failed", { error: result.error });

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error("Cron sync error", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Allow POST as well for manual triggers
export const POST = GET;
