import { ElevenLabsClient } from "elevenlabs";
import { env } from "@/env";

export function createElevenLabsClient() {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  return new ElevenLabsClient({
    apiKey: env.ELEVENLABS_API_KEY,
  });
}

export const VOICE_IDS = {
  // Professional voices
  rachel: "21m00Tcm4TlvDq8ikWAM", // Calm, professional female
  adam: "pNInz6obpgDQGcFmaJgB", // Deep, authoritative male
  domi: "AZnzlk1XvdvUeBnXmlld", // Strong, confident female
  elli: "MF3mGyEYCl7XYWbV9V6O", // Energetic, friendly female
  josh: "TxGEqnHWrfWFTfGW9XjX", // Young, casual male
  arnold: "VR6AewLTigWG4xSOukaG", // Crisp, clear male
  antoni: "ErXwobaYiN019PkySvjV", // Well-rounded, versatile male
  thomas: "GBv7mTt0atIp3Br8iCZE", // Mature, calm male
} as const;

export type VoiceId = keyof typeof VOICE_IDS;

export async function* streamTextToSpeech(
  text: string,
  voiceId: VoiceId = "rachel",
) {
  const client = createElevenLabsClient();

  const audioStream = await client.textToSpeech.convertAsStream(
    VOICE_IDS[voiceId],
    {
      text,
      model_id: "eleven_turbo_v2_5", // Fastest model with lowest latency
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    },
  );

  for await (const chunk of audioStream) {
    yield chunk;
  }
}

export async function getAvailableVoices() {
  const client = createElevenLabsClient();
  const voices = await client.voices.getAll();
  return voices.voices;
}
