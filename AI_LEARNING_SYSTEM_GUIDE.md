 🧠 AI Learning System - Complete Guide

## Overview

This system allows **Jenn** (your AI assistant) to learn from user conversations and improve over time by fine-tuning your custom Ollama LLM model.

---

## 🎯 What Was Built

### 1. **User Consent System**
- ✅ Beautiful consent banner on the Assistant page
- ✅ User can accept or decline learning
- ✅ Consent stored in database with timestamp
- ✅ Only collects data if user has given consent

### 2. **Training Data Collection**
- ✅ Automatically collects chat conversations
- ✅ Stores user messages and AI responses
- ✅ Records tool calls (rule creation, email search, etc.)
- ✅ Includes context (email subjects, rule details)
- ✅ Quality tracking (good/bad/neutral)

### 3. **Data Export API**
- ✅ Export training data in JSONL format
- ✅ Compatible with Ollama/LLaMA fine-tuning
- ✅ Filters out bad quality data
- ✅ Respects user consent

---

## 📋 Database Changes

### New Fields in `EmailAccount`:
```prisma
aiLearningConsent   Boolean?  @default(false)
aiLearningConsentAt DateTime?
```

### New Model `AiTrainingData`:
```prisma
model AiTrainingData {
  id                 String
  createdAt          DateTime
  emailAccountId     String
  chatId             String?
  conversationType   String  // "chat", "rule_execution", "email_processing"
  userMessage        String
  assistantResponse  String
  toolCalls          Json?
  context            Json?
  feedback           String?
  quality            String? // "good", "bad", "neutral"
}
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
cd /root/inbox-zero/apps/web
npx prisma migrate dev --name add_ai_learning
npx prisma generate
```

This will:
- Add consent fields to EmailAccount
- Create AiTrainingData table
- Update Prisma client

### Step 2: Restart Your Dev Server

```bash
# Kill existing server
pkill -f "next dev"

# Start fresh
pnpm dev
```

### Step 3: Test the System

1. Navigate to **Email Assistant** page
2. You should see the learning consent banner
3. Click **"Yes, Help Jenn Learn"**
4. Start chatting with Jenn
5. Data will be collected automatically

---

## 📊 How Data Collection Works

### When Data is Collected:

1. **Chat Conversations**
   - User sends a message
   - Jenn responds
   - If consent = true → Save to database

2. **Tool Executions**
   - User asks to create a rule
   - Jenn creates the rule
   - Tool call details saved

3. **Context Included**
   - Email subjects (when fixing rules)
   - Rule names and conditions
   - Search queries

### What Gets Stored:

```json
{
  "userMessage": "Create a rule to archive newsletters",
  "assistantResponse": "I created a rule to archive newsletters...",
  "toolCalls": [
    {
      "name": "createRule",
      "arguments": {
        "name": "Newsletters",
        "condition": {...},
        "actions": [...]
      }
    }
  ],
  "context": {
    "type": "chat"
  },
  "quality": "neutral"
}
```

---

## 🔄 Exporting Training Data

### API Endpoint:
```
GET /api/admin/training-data?format=jsonl&limit=1000
```

### Using cURL:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/admin/training-data?format=jsonl" \
  -o training-data.jsonl
```

### Output Format (JSONL):
```jsonl
{"messages":[{"role":"user","content":"Create a rule..."},{"role":"assistant","content":"I created...","tool_calls":[...]}]}
{"messages":[{"role":"user","content":"Search for..."},{"role":"assistant","content":"I found..."}]}
```

---

## 🤖 Fine-Tuning Your Ollama Model

### On Your Ollama Server (http://65.108.60.66:11434)

### Step 1: Export Training Data

From your Angri application:
```bash
curl -H "x-email-account-id: YOUR_EMAIL_ACCOUNT_ID" \
  "http://your-app-url/api/admin/training-data?format=jsonl&limit=5000" \
  -o /path/to/training-data.jsonl
```

### Step 2: Prepare the Data

Transfer the file to your Ollama server:
```bash
scp training-data.jsonl user@65.108.60.66:/home/user/ollama-training/
```

### Step 3: Create a Modelfile

On your Ollama server, create `Modelfile`:
```dockerfile
FROM llama3.2:3b

# Set parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

# System prompt
SYSTEM """
You are Jenn, an AI email assistant from Tynk Tech.
You help users manage their inbox through automation and intelligent responses.
"""
```

### Step 4: Fine-Tune the Model

```bash
# Install ollama if not already installed
curl https://ollama.ai/install.sh | sh

# Create base model
ollama create jenn-base -f Modelfile

# Fine-tune with your data
ollama create jenn-v1 \
  --from jenn-base \
  --adapter training-data.jsonl
```

### Step 5: Test the Fine-Tuned Model

```bash
ollama run jenn-v1
```

Try asking it questions similar to your training data:
```
>>> Create a rule to archive marketing emails
```

### Step 6: Deploy the Fine-Tuned Model

Update your `.env` file:
```env
NEXT_PUBLIC_OLLAMA_MODEL=jenn-v1
DEFAULT_LLM_MODEL=jenn-v1
ECONOMY_LLM_MODEL=jenn-v1
CHAT_LLM_MODEL=jenn-v1
```

Restart your application:
```bash
pnpm dev
```

---

## 📈 Continuous Learning Workflow

### 1. **Collect Data** (Automatic)
- Users chat with Jenn
- Data saved to database
- Quality tracked

### 2. **Review Quality** (Manual)
```sql
-- Check training data quality
SELECT 
  conversationType,
  quality,
  COUNT(*) as count
FROM "AiTrainingData"
GROUP BY conversationType, quality;

-- Mark bad responses
UPDATE "AiTrainingData"
SET quality = 'bad'
WHERE id = 'some-id';
```

### 3. **Export Data** (Weekly/Monthly)
```bash
# Export last 30 days
curl "http://your-app/api/admin/training-data?format=jsonl&limit=10000" \
  -o training-$(date +%Y%m%d).jsonl
```

### 4. **Fine-Tune Model** (Weekly/Monthly)
```bash
# On Ollama server
ollama create jenn-v2 \
  --from jenn-v1 \
  --adapter training-$(date +%Y%m%d).jsonl
```

### 5. **Deploy New Version**
```bash
# Update .env
NEXT_PUBLIC_OLLAMA_MODEL=jenn-v2

# Restart app
pnpm dev
```

---

## 🎓 Advanced: Training Data Quality

### Automatic Quality Detection

You can enhance the system to automatically detect quality:

```typescript
// In collect-training-data.ts
function detectQuality(userMessage: string, assistantResponse: string, toolCalls: any) {
  // Good indicators
  if (toolCalls &#& toolCalls.length > 0) return "good"; // Successful tool use
  if (assistantResponse.length > 100) return "good"; // Detailed response
  
  // Bad indicators
  if (assistantResponse.includes("I don't know")) return "bad";
  if (assistantResponse.includes("error")) return "bad";
  
  return "neutral";
}
```

### User Feedback Integration

Add thumbs up/down buttons to chat messages:

```typescript
// In chat component
<button onClick={() => rateResponse(messageId, "good")}>👍</button>
<button onClick={() => rateResponse(messageId, "bad")}>👎</button>
```

---

## 🔒 Privacy & Security

### Data Privacy:
- ✅ All data stays on YOUR server
- ✅ No external API calls for training
- ✅ User consent required
- ✅ Can be deleted anytime

### Delete User Data:
```sql
DELETE FROM "AiTrainingData"
WHERE emailAccountId = 'user-email-account-id';
```

### Disable Learning:
```sql
UPDATE "EmailAccount"
SET aiLearningConsent = false
WHERE id = 'email-account-id';
```

---

## 📊 Monitoring & Analytics

### Check Training Data Stats:
```sql
-- Total conversations collected
SELECT COUNT(*) FROM "AiTrainingData";

-- By conversation type
SELECT conversationType, COUNT(*) 
FROM "AiTrainingData"
GROUP BY conversationType;

-- Recent activity
SELECT DATE(createdAt), COUNT(*)
FROM "AiTrainingData"
WHERE createdAt > NOW() - INTERVAL '7 days'
GROUP BY DATE(createdAt);

-- Users who gave consent
SELECT COUNT(*) 
FROM "EmailAccount"
WHERE aiLearningConsent = true;
```

---

## 🚨 Troubleshooting

### Issue: No data being collected
**Check:**
1. User has given consent
2. Database migration ran successfully
3. No errors in server logs

```bash
# Check consent
psql -d your_database -c "SELECT email, aiLearningConsent FROM \"EmailAccount\";"

# Check training data
psql -d your_database -c "SELECT COUNT(*) FROM \"AiTrainingData\";"
```

### Issue: Export fails
**Check:**
1. User has consent
2. Training data exists
3. API authentication

### Issue: Fine-tuning fails
**Check:**
1. JSONL format is correct
2. Ollama server has enough resources
3. Base model exists

---

## 🎯 Next Steps

### Immediate:
1. ✅ Run database migration
2. ✅ Test consent banner
3. ✅ Chat with Jenn to collect data

### Short-term (1-2 weeks):
1. Collect 100+ conversations
2. Export training data
3. Test fine-tuning process

### Long-term (Monthly):
1. Regular fine-tuning cycles
2. Quality monitoring
3. Model version management

---

## 📚 Resources

### Ollama Documentation:
- https://github.com/ollama/ollama/blob/main/docs/modelfile.md
- https://github.com/ollama/ollama/blob/main/docs/faq.md

### LLaMA Fine-Tuning:
- https://github.com/meta-llama/llama-recipes
- https://huggingface.co/docs/transformers/training

### JSONL Format:
- https://jsonlines.org/

---

## ✅ Summary

You now have a complete AI learning system that:
1. ✅ Asks users for consent
2. ✅ Collects training data automatically
3. ✅ Exports data in Ollama-compatible format
4. ✅ Enables continuous model improvement
5. ✅ Respects user privacy

**Your AI will get smarter with every conversation!** 🚀
