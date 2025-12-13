# Pricing Strategy & Feature Isolation for Angri AI (Self-Hosted)

Since you are running your own AI models (Ollama), your cost structure is fundamentally different from API-based competitors. Your inference cost is **fixed** (hardware/electricity), not variable (per token). This allows you to offer generous plans with high margins.

This guide outlines potential pricing tiers and how to isolate features technically to drive upsells.

## 💰 Recommended Pricing Tiers

### 1. Free / "Lite" (The Hook)
**Goal:** User acquisition and basic email hygiene.
**Cost:** Free
**Limits:**
-   **AI Model:** Quantized Llama 3.2 3B (Fastest, lowest resource usage).
-   **Context Window:** Small (e.g., last 5 emails in thread).
-   **Actions:** Read-only (Labeling, Categorization). No sending.
-   **Retention:** 30 days of history.

**Included Features:**
-   Smart Inbox (Reply Zero UI)
-   Bulk Unsubscribe
-   Basic Categorization (Newsletters, Updates)
-   Daily Digest (Summary of the day)

### 2. Pro / "Business" (The Standard)
**Goal:** Daily productivity for professionals.
**Cost:** €15 - €25 / month
**Limits:**
-   **AI Model:** Llama 3.1 8B (Better reasoning).
-   **Context Window:** Full thread history.
-   **Actions:** Full Write Access (Drafts, Replies, Rule Creation).
-   **Retention:** Unlimited.

**Included Features:**
-   **Everything in Free**
-   **AI Auto-Drafting:** Jenn pre-writes replies for you.
-   **Custom Rules:** "If receipt, label Finance" (Unlimited).
-   **Voice Mode:** Talk to your inbox (Deepgram/ElevenLabs integration).
-   **Cold Email Blocker:** Aggressive filtering.

### 3. Enterprise / "Sovereign" (The Whale)
**Goal:** High-value business automation & privacy.
**Cost:** €50+ / month or Custom
**Limits:**
-   **AI Model:** Qwen 2.5 32B or Llama 3.1 70B (Server dependent, highest IQ).
-   **Priority Queue:** Their requests skip the line on your GPU.
-   **Dedicated Isolation:** Option for single-tenant databases.

**Included Features:**
-   **Everything in Pro**
-   **Integrations:** Odoo, PrestaShop, Stripe bridges.
-   **RAG (Knowledge Base):** Upload PDFs/Docs for Jenn to reference in replies.
-   **Team Workflows:** Delegate emails to other team members.
-   **White Labeling:** Custom branding.

---

## 🔒 Technical Feature Isolation (How to Lock Features)

To enforce these tiers, you need to gate functionality in your codebase.

### 1. Model Switching (Quality Gate)
You can dynamically assign different models based on the user's plan.
*   **Free Users:** Route to `llama3.2:3b` (Low VRAM usage).
*   **Pro Users:** Route to `llama3.1:8b` or `qwen2.5:14b` (Better quality).

**Implementation:**
In `apps/web/utils/llms/model.ts`, check the user's plan before creating the model instance.
```typescript
const modelName = user.plan === 'PRO' ? 'llama3.1:8b' : 'llama3.2:3b';
```

### 2. Rate Limiting (Usage Gate)
Since you pay for compute time, you must limit abuse.
*   **Free:** 50 AI actions / day.
*   **Pro:** 500 AI actions / day.
*   **Enterprise:** Unlimited (Fair Use).

**Implementation:**
Use Redis (Upstash) to count daily usage per user ID. Reject requests in `apps/web/app/api/chat/route.ts` if the limit is exceeded.

### 3. Tool Gating (Capability Gate)
Prevent Free users from accessing "expensive" or "dangerous" tools.
*   **Tools to Lock:** `draftReply`, `createRule`, `searchKnowledgeBase`, `integrationTools`.
*   **Tools Open:** `categorizeEmail`, `summarizeThread`.

**Implementation:**
In `apps/web/utils/ai/assistant/chat.ts`, filter the `tools` array passed to the AI SDK based on the user's tier.
```typescript
const availableTools = {
  ...baseTools,
  ...(isPro ? proTools : {}),
  ...(isEnterprise ? enterpriseTools : {})
};
```

### 4. Integration Gating (Value Gate)
Integrations are high-value. Someone using Odoo or Stripe is running a business and has budget.
*   **Logic:** Check `plan` before running `syncPrestashopOrderToOdoo`.

---

## 📊 Estimated Margins (Self-Hosted)

**Scenario:** You rent a dedicated server with 1x A6000 GPU (~€600/month).
*   **Capacity:** Can handle ~5 concurrent heavy requests or ~20 lightweight ones per second.
*   **User Base:** With smart queuing, this single server could support 500-1000 active daily users (since email is bursty, not constant).

**Math:**
-   **Cost:** €600/mo
-   **Revenue (500 Pro users @ €20):** €10,000/mo
-   **Margin:** ~94% (excluding other overhead like storage/bandwidth).

Your self-hosted model allows you to scale users significantly cheaper than paying OpenAI $0.03 per request.
