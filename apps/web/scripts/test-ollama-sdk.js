
console.log("Starting script...");
try {
  const { createOpenAI } = require("@ai-sdk/openai");
  const { streamText } = require("ai");
  const path = require("path");
  const dotenv = require("dotenv");

  // Load environment variables
  console.log("Loading env...");
  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
  const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || "llama3.2:3b";

  console.log("Testing Ollama via OpenAI Provider...");
  console.log(`Base URL: ${OLLAMA_BASE_URL}/v1`);
  console.log(`Model: ${OLLAMA_MODEL}`);

  async function test() {
    try {
      const ollama = createOpenAI({
        baseURL: `${OLLAMA_BASE_URL}/v1`,
        apiKey: "ollama",
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
} catch (e) {
  console.error("Top level error:", e);
}
