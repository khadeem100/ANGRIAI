import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { createDeepgramClient } from "@/utils/voice/deepgram-client";

export const maxDuration = 300;

// WebSocket endpoint for live transcription
export const POST = withEmailAccount("voice-transcribe", async (request) => {
  try {
    const deepgram = createDeepgramClient();

    // Get audio data from request
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe audio
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
        language: "en",
      },
    );

    if (error) {
      request.logger.error("Deepgram transcription error", { error });
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 },
      );
    }

    const transcript =
      result.results?.channels[0]?.alternatives[0]?.transcript || "";

    return NextResponse.json({ transcript });
  } catch (error) {
    request.logger.error("Error in voice transcription", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
