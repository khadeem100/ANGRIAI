# Deep Dive: Workforce & AI Agents

This document details the architecture and functionality of the "Workforce" feature in Inbox Zero.

## 1. Concept & Architecture

The **Workforce** is a conceptual layer built on top of the application's core **AI Personal Assistant** and **Rule Engine**. It frames AI capabilities as specialized "Agents" to help users visualize and manage different domains of their work.

**Current Agents:**
1.  **Customer Service Agent** (Active) - Manages general inbox flow, replies, and sorting.
2.  **HR Manager** (Planned)
3.  **Finance Analyst** (Planned)
4.  **Marketing Specialist** (Planned)

### Directory Structure
-   **Frontend**: `apps/web/app/(app)/[emailAccountId]/workforce/`
-   **Logic**: Shared with `apps/web/app/(app)/[emailAccountId]/assistant/` (Rules, History, Process).
-   **Configuration**: `apps/web/utils/rule/consts.ts` (Defines System Rules).

---

## 2. Customer Service Agent (Active)

The Customer Service Agent is the default "General Purpose" AI. It is pre-configured with a set of **System Rules** that handle common email patterns.

### System Rules (The Agent's "Brain")

These rules are hardcoded in `utils/rule/consts.ts` and provided to every user.

| Rule Name | Purpose | Default Actions | Run on Threads |
| :--- | :--- | :--- | :--- |
| **To Reply** | Emails needing a direct response. | **Label**: "To Reply"<br>**Draft Reply**: Yes (AI writes a draft) | Yes |
| **FYI** | Important info, no reply needed. | **Label**: "FYI" | Yes |
| **Awaiting Reply** | Emails you are waiting for. | **Label**: "Awaiting Reply" | Yes |
| **Actioned** | Resolved threads. | **Label**: "Actioned" | Yes |
| **Newsletter** | Subscriptions & Blogs. | **Label**: "Newsletter" (or Move Folder) | No |
| **Marketing** | Promotions & Sales. | **Label**: "Marketing"<br>**Archive**: Yes | No |
| **Receipt** | Invoices & Payments. | **Label**: "Receipt" | No |
| **Cold Email** | Unsolicited sales pitches. | **Label**: "Cold Email"<br>**Archive**: Yes | No |

### User Customization
Users can extend the agent's capabilities by adding **Custom Rules** via the "Rules" tab.
-   **Static Conditions**: Match by Sender, Recipient, Subject, Body (Regex supported).
-   **AI Instructions**: Natural language prompts (e.g., "If it's from a VIP client, mark as High Priority").

---

## 3. The Engine: How it Works

The Agent operates via a 3-step pipeline:

1.  **Ingestion & Simulation**:
    -   Emails are fetched via Gmail API or IMAP.
    -   The `Process` tab (`ProcessRules.tsx`) allows users to "Test" rules against their actual email history (`/api/messages`) without side effects.
    -   It uses `runRulesAction` to simulate the AI's decision-making.

2.  **Decision Making (`choose-rule/`)**:
    -   **Short-Circuit**: Checks for "Cold Email" or "Learned Patterns" (Groups) first to save AI tokens.
    -   **Rule Matching**:
        -   Evaluates Static conditions.
        -   If AI is needed, it compiles a prompt with the email content + relevant rules and asks an LLM (OpenAI/Gemini/etc.) to choose the best rule.
    -   **Conflict Resolution**: System rules have a predefined order (`SYSTEM_RULE_ORDER`).

3.  **Execution (`execute.ts`)**:
    -   The selected Rule's **Actions** are applied.
    -   **Actions include**: Label, Archive, Trash, Mark Read, Draft Reply, Reply, Forward, Webhook.
    -   **Audit Log**: Every action is recorded in `ExecutedRule` table, visible in the "History" tab.

---

## 4. Future Expansion (HR, Finance, Marketing)

The infrastructure is ready for specialized agents. Implementing them would involve:
1.  **New System Types**: Defining `SystemType.HR_CANDIDATE`, `SystemType.FINANCE_INVOICE`, etc.
2.  **Specialized Actions**:
    -   **Finance**: Extract PDF data to CSV/Quickbooks.
    -   **HR**: Parse resumes, schedule interviews via Calendar API.
    -   **Marketing**: Analyze sentiment, draft social posts.
3.  **Dedicated Views**: Creating specialized UI pages similar to `customer-service/page.tsx` but with domain-specific components.
