import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { getAvailableVoices, VOICE_IDS } from "@/utils/voice/elevenlabs-client";

export const maxDuration = 60;

export const GET = withEmailAccount("voice-list", async (request) => {
  try {
    // Return our curated list of voices
    const voices = Object.entries(VOICE_IDS).map(([name, id]) => ({
      id,
      name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
    }));

    return NextResponse.json({ voices });
  } catch (error) {
    request.logger.error("Error fetching voices", { error });
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 },
    );
  }
});
