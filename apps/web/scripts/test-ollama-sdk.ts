import { createOllama } from "ollama-ai-provider";
import { streamText } from "ai";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "llama3.2:3b";

console.log("Testing Ollama SDK...");
console.log(`Base URL: ${OLLAMA_BASE_URL}`);
console.log(`Model: ${OLLAMA_MODEL}`);

async function test() {
  try {
    const ollama = createOllama({
      baseURL: OLLAMA_BASE_URL,
    });

    console.log("Sending request...");
    const result = await streamText({
      model: ollama(OLLAMA_MODEL),
      messages: [{ role: "user", content: "Hi there! What is your name?" }],
    });

    console.log("Streaming response...");
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
