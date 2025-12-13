// const fetch = require('node-fetch'); // Native fetch is available in Node 22+

// Usage: node apps/web/scripts/test-ollama.js [url] [model]
// Default URL: http://localhost:11434/api
// Default Model: llama3

const url = process.argv[2] || "http://65.108.60.66:11434/api";
const model = process.argv[3] || "llama3.2:3b";

console.log("Testing Ollama connection...");
console.log(`URL: ${url}`);
console.log(`Model: ${model}`);

async function testConnection() {
  try {
    // 1. Test Version Endpoint (Note: /api/version doesn't exist on all versions, but /api/tags does)
    // Actually the base URL usually has /api appended. So we check /api/tags (if url has /api) or /tags

    // Let's try to list tags first.
    // If user provided http://host:port/api, we want http://host:port/api/tags
    const tagsUrl = `${url.replace(/\/$/, "")}/tags`;
    console.log(`Fetching tags from ${tagsUrl}...`);

    const tagsResponse = await fetch(tagsUrl);

    if (!tagsResponse.ok) {
      console.error(
        `❌ Failed to connect to Ollama: ${tagsResponse.status} ${tagsResponse.statusText}`,
      );
      const text = await tagsResponse.text();
      console.error("Response:", text);
      return;
    }

    const tagsData = await tagsResponse.json();
    console.log("✅ Connected to Ollama!");
    console.log(
      "Available models:",
      tagsData.models.map((m) => m.name).join(", "),
    );

    const modelExists = tagsData.models.some((m) => m.name.includes(model));
    if (!modelExists) {
      console.warn(
        `⚠️ Warning: Model "${model}" not found in list. You may need to run "ollama pull ${model}" on the server.`,
      );
    } else {
      console.log(`✅ Model "${model}" is available.`);
    }

    // 2. Test Generation
    console.log("\nTesting generation...");
    const generateUrl = `${url.replace(/\/$/, "")}/generate`;
    const generateResponse = await fetch(generateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: 'Say "Hello from your self-hosted AI!"',
        stream: false,
      }),
    });

    if (!generateResponse.ok) {
      console.error(
        `❌ Generation failed: ${generateResponse.status} ${generateResponse.statusText}`,
      );
      const text = await generateResponse.text();
      console.error("Response:", text);
      return;
    }

    const generateData = await generateResponse.json();
    console.log("✅ Generation successful!");
    console.log("Response:", generateData.response);
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Tip: Make sure Ollama is running and accessible. If running locally, check port 11434. If remote, check IP and firewall.",
      );
    }
  }
}

testConnection();
