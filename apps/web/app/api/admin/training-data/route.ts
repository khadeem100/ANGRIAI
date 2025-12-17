import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import prisma from "@/utils/prisma";

// Export training data for fine-tuning
export const GET = withEmailAccount("admin/training-data", async (request) => {
  const { emailAccountId } = request.auth;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "jsonl";
  const limit = Number.parseInt(searchParams.get("limit") || "1000");

  // Check if user has given consent
  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
    select: { aiLearningConsent: true },
  });

  if (!emailAccount?.aiLearningConsent) {
    return NextResponse.json(
      { error: "AI learning consent not given" },
      { status: 403 },
    );
  }

  // Fetch training data
  const trainingData = await prisma.aiTrainingData.findMany({
    where: {
      emailAccountId,
      quality: { not: "bad" }, // Exclude bad quality data
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (format === "jsonl") {
    // Format for Ollama/LLaMA fine-tuning
    const jsonlData = trainingData
      .map((item) => {
        const conversation = {
          messages: [
            {
              role: "user",
              content: item.userMessage,
            },
            {
              role: "assistant",
              content: item.assistantResponse,
            },
          ],
        };

        // Add tool calls if present
        if (item.toolCalls) {
          conversation.messages[1] = {
            ...conversation.messages[1],
            tool_calls: item.toolCalls,
          } as any;
        }

        return JSON.stringify(conversation);
      })
      .join("\n");

    return new NextResponse(jsonlData, {
      headers: {
        "Content-Type": "application/jsonl",
        "Content-Disposition": `attachment; filename="training-data-${Date.now()}.jsonl"`,
      },
    });
  }

  // Return as JSON
  return NextResponse.json({
    count: trainingData.length,
    data: trainingData,
  });
});
