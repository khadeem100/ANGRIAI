# Angri AI (Jenn) - Comprehensive Feature Documentation

**Developed by Tynk Tech VOF (Netherlands)**

Angri AI (powered by the persona "Jenn") is a sovereign, intelligent email workforce platform designed to achieve "Inbox Zero" through automation, AI-driven categorization, and seamless business integration. It runs on your own infrastructure for maximum privacy.

## 🧠 Core AI & "Sovereign" Identity
-   **Self-Hosted Engine:** Runs entirely on your own servers (via Ollama), ensuring no email data leaves your infrastructure.
-   **Identity ("Jenn"):** The AI has a specific persona—professional, efficient, and loyal to Tynk Tech VOF. She is aware of her environment and role as the central node of your workforce.
-   **Multi-Provider Support:** While optimized for local execution (Llama 3, Qwen), the platform supports fallback to OpenAI, Anthropic, Google Gemini, and Bedrock if configured.

## 📧 Email Management & Automation

### 1. Smart Inbox Processing
-   **Reply Zero:** Automatically identifies emails that require a reply ("To Reply") and those you are waiting on ("Awaiting Response").
-   **Bulk Unsubscribe:** Detects newsletters and marketing emails, allowing you to unsubscribe from them in bulk with a single click.
-   **Cold Email Blocker:** Identifies and blocks unsolicited cold outreach emails to keep your focus on genuine business.
-   **Smart Categorization:** Uses AI to sort emails into categories like "Newsletters," "Finance," "Updates," and "Personal" automatically.

### 2. The Rule Engine
A powerful "If This Then That" system powered by AI.
-   **Natural Language Rules:** Create rules by just telling Jenn what you want (e.g., "If it's a receipt, label it Finance and forward it to my accountant").
-   **Hybrid Logic:** Combines "Static" conditions (Sender is @google.com) with "AI Instructions" (Content is about a meeting).
-   **Learned Patterns:** The AI observes your behavior and "learns" to include or exclude specific senders from rules over time without you needing to edit complex logic.
-   **Actions:**
    -   Archive / Delete
    -   Label / Move to Folder
    -   Mark as Read / Spam
    -   **Draft Reply:** AI pre-writes a response for you to review.
    -   **Auto-Reply:** (Use with caution) AI sends a reply automatically.
    -   **Forward:** Send to another person or system.
    -   **Webhook:** Trigger external API calls.

### 3. AI Assistant (Chat)
A sidebar chat interface where you can talk to Jenn directly.
-   **Context Aware:** Jenn knows about your current email, your rules, and your business settings.
-   **Actionable:** She can perform actions for you (e.g., "Reply to this email saying I'm interested," "Create a rule for this client").
-   **Knowledge Base:** You can add specific facts or documents to a knowledge base that Jenn uses to draft more accurate replies.

## 🏢 Business Workforce & Integrations
Jenn is not alone; she coordinates a "Workforce" of specialized agents and connects to your business tools.

### 1. The "Workforce"
-   **Specialized Agents:** Concepts for HR, Finance, and Marketing agents that work alongside the main Customer Service agent.

### 2. Integrations (App Store)
-   **E-Commerce Bridge:**
    -   **PrestaShop & Odoo:** Sync orders, products, and stock levels between your e-commerce store and ERP system.
    -   **Stripe:** Monitor subscriptions and payments.
-   **Productivity:**
    -   **Notion / Monday:** Create tasks or save information directly from emails.
    -   **Calendars:** Manage scheduling and invites.

## 📊 Analytics & Insights
-   **Email Stats:** Visualizes your email volume, response times, and most active senders.
-   **AI Usage:** Tracks how many tokens and resources your AI models are consuming.

## 🛡️ Privacy & Security
-   **Local First:** Designed to run with local LLMs (Ollama) so sensitive business data remains private.
-   **Permissions:** Granular control over what the AI can access.

## 🗣️ Voice Capabilities
-   **Voice Chat:** Interact with Jenn using voice commands (via Deepgram for transcription and ElevenLabs for synthesis), making email management hands-free.
