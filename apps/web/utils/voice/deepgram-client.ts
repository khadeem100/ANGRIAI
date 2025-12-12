import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { env } from "@/env";

export function createDeepgramClient() {
  if (!env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not set");
  }

  return createClient(env.DEEPGRAM_API_KEY);
}

export type TranscriptionCallback = (transcript: string, isFinal: boolean) => void;

export async function startLiveTranscription(
  onTranscript: TranscriptionCallback,
  onError?: (error: Error) => void,
) {
  const deepgram = createDeepgramClient();

  const connection = deepgram.listen.live({
    model: "nova-2",
    language: "en",
    smart_format: true,
    interim_results: true,
    punctuate: true,
    utterance_end_ms: 1000, // End utterance after 1 second of silence
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Deepgram connection opened");
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
    const transcript = data.channel.alternatives[0]?.transcript;
    const isFinal = data.is_final;

    if (transcript && transcript.length > 0) {
      onTranscript(transcript, isFinal);
    }
  });

  connection.on(LiveTranscriptionEvents.Error, (error: any) => {
    console.error("Deepgram error:", error);
    if (onError) onError(new Error(error.message || "Deepgram error"));
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log("Deepgram connection closed");
  });

  return connection;
}
