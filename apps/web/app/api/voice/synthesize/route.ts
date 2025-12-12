import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { streamTextToSpeech, type VoiceId } from "@/utils/voice/elevenlabs-client";
import { z } from "zod";

export const maxDuration = 300;

const synthesizeSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.enum([
    "rachel",
    "adam",
    "domi",
    "elli",
    "josh",
    "arnold",
    "antoni",
    "thomas",
  ]).optional().default("rachel"),
});

export const POST = withEmailAccount("voice-synthesize", async (request) => {
  try {
    const json = await request.json();
    const { data, error } = synthesizeSchema.safeParse(json);

    if (error) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 },
      );
    }

    const { text, voiceId } = data;

    // Create a readable stream for the audio
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamTextToSpeech(text, voiceId as VoiceId)) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          request.logger.error("Error streaming audio", { error });
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    request.logger.error("Error in voice synthesis", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
