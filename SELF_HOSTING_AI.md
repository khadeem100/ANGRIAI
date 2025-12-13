# Self-Hosting AI with Ollama

This guide explains how to run your own AI models locally using Ollama and connect them to Inbox Zero. This allows for complete data privacy and zero inference costs.

## Prerequisites

- [Ollama](https://ollama.com/) installed on your machine or server.
- Sufficient RAM/VRAM for the model you want to run (e.g., 8GB for Llama 3 8B, 16GB+ for larger models).

## 1. Setup Ollama

1.  **Install Ollama:** Follow the instructions at [ollama.com](https://ollama.com).
2.  **Pull a Model:** Open your terminal and pull a model. We recommend Llama 3 for a good balance of speed and performance.
    ```bash
    ollama pull llama3
    ```
    Or for a smaller, faster model:
    ```bash
    ollama pull mistral
    ```
3.  **Start Ollama:**
    ```bash
    ollama serve
    ```
    *Note: By default, Ollama runs on `http://localhost:11434`. To allow remote connections, you must set `OLLAMA_HOST=0.0.0.0` on the machine running Ollama.*

    **For Remote Access (Linux/Mac):**
    ```bash
    OLLAMA_HOST=0.0.0.0 ollama serve
    ```

## 2. Configure Inbox Zero

You need to set two environment variables to tell Inbox Zero to use your remote Ollama instance.

Add these to your `.env` file (create one in `apps/web/.env` if it doesn't exist, or add to your deployment environment variables):

```env
# The URL where Ollama is running. 
# REPLACE [YOUR_SERVER_IP] with the actual IP address (e.g., 192.168.1.50)
OLLAMA_BASE_URL=http://[YOUR_SERVER_IP]:11434/api

# The name of the model you pulled (must match exactly)
NEXT_PUBLIC_OLLAMA_MODEL=llama3.1
```

## 3. Enable in Application

1.  Restart your Inbox Zero application.
2.  Navigate to **Settings > AI**.
3.  You should now see "Ollama" available in the provider dropdown list.
4.  Select **Ollama** as your default provider.

## 4. Test Connection

We've included a script to verify your app can reach the remote server.

Run this from the project root:
```bash
node apps/web/scripts/test-ollama.js http://[YOUR_SERVER_IP]:11434/api llama3.1
```
*(Replace `[YOUR_SERVER_IP]` and `llama3.1` with your values)*

## Troubleshooting

-   **Connection Refused:** 
    - Ensure Ollama is running with `OLLAMA_HOST=0.0.0.0`. 
    - Check your server's firewall (port 11434 must be open).
    - If running via Docker, make sure the port is mapped (`-p 11434:11434`).
-   **Model Not Found:** Ensure the value in `NEXT_PUBLIC_OLLAMA_MODEL` matches exactly what you see when running `ollama list` on the server.
-   **CORS Issues:** If you experience issues, try running Ollama with:
    ```bash
    OLLAMA_ORIGINS="*" OLLAMA_HOST=0.0.0.0 ollama serve
    ```

## Recommended Models

-   **llama3**: Best all-rounder (8B parameters).
-   **mistral**: Good performance, slightly older.
-   **gemma**: Google's open model, very fast.
-   **qwen**: Excellent performance for coding and logic.
