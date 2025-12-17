# 🚀 Quick Start - Automated AI Learning

## For You (Angri Application)

### 1. Run Setup Script
```bash
cd /root/inbox-zero
./setup-ai-learning.sh
```

### 2. Update Cron Secret
```bash
# Generate secret
openssl rand -hex 32

# Update .env
nano apps/web/.env
# Change: CRON_SECRET=<your-generated-secret>
```

### 3. Restart Application
```bash
pkill -f "next dev"
pnpm dev
```

### 4. Test It
- Go to Email Assistant page
- Accept learning consent banner
- Chat with Jenn
- Data automatically syncs to Ollama server!

---

## For Your Ollama Server AI

### Give This File to Your AI:
📄 **`OLLAMA_SERVER_INSTRUCTIONS.md`**

The AI will automatically:
1. ✅ Install Python & Flask
2. ✅ Create training data receiver (port 5000)
3. ✅ Set up auto fine-tuning script
4. ✅ Configure daily cron jobs (2 AM)
5. ✅ Test the entire system

---

## How It Works

```
User chats → Data saved → Auto-synced to Ollama → Daily fine-tune → Jenn gets smarter!
```

---

## Monitoring

### Check if data is syncing:
```bash
# On Ollama server
tail -f /opt/jenn-learning/logs/receiver.log
```

### Check fine-tuning:
```bash
# On Ollama server
tail -f /opt/jenn-learning/logs/finetune.log
```

### Check model versions:
```bash
# On Ollama server
ollama list | grep jenn
```

---

## Configuration

Your `.env` already has:
```env
OLLAMA_TRAINING_ENDPOINT=http://65.108.60.66:5000/receive-training-data
OLLAMA_AUTO_SYNC=true  # Real-time sync enabled
CRON_SECRET=<change-this>  # ⚠️ CHANGE THIS!
```

Plus hourly backup sync via Vercel Cron (already configured).

---

## Full Documentation

- **AUTOMATED_LEARNING_SETUP.md** - Complete setup guide
- **OLLAMA_SERVER_INSTRUCTIONS.md** - Give this to your Ollama server AI
- **AI_LEARNING_SYSTEM_GUIDE.md** - Original detailed guide

---

## That's It!

Once setup is complete, Jenn will automatically learn from every conversation and improve daily! 🧠✨
