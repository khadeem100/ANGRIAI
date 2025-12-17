# 🤖 Automated AI Learning System - Complete Setup Guide

## Overview
This system automatically sends training data from your Angri application to your Ollama server and triggers fine-tuning to continuously improve Jenn.

---

## 🎯 How It Works

```
User chats with Jenn
    ↓
Training data saved to database
    ↓
AUTOMATICALLY sent to Ollama server (real-time or hourly)
    ↓
Ollama server receives and stores data
    ↓
Daily cron job fine-tunes the model
    ↓
New model deployed as jenn:latest
    ↓
Angri uses improved model
    ↓
Jenn gets smarter! 🧠
```

---

## 📋 Setup Steps

### PART 1: Angri Application Setup

#### Step 1: Run Database Migration
```bash
cd /root/inbox-zero
./setup-ai-learning.sh
```

This creates:
- `aiLearningConsent` fields in EmailAccount
- `AiTrainingData` table
- Prisma client updates

#### Step 2: Configure Environment Variables

Your `.env` already has:
```env
# Ollama Training Sync
OLLAMA_TRAINING_ENDPOINT=http://65.108.60.66:5000/receive-training-data
OLLAMA_AUTO_SYNC=true
CRON_SECRET=your-cron-secret-change-this
```

**Change the CRON_SECRET** to something secure:
```bash
# Generate a random secret
openssl rand -hex 32
```

Update `.env`:
```env
CRON_SECRET=<your-generated-secret>
```

#### Step 3: Set Up Cron Job (Optional - for hourly sync)

If you want scheduled syncs instead of real-time:

**Option A: Using Vercel Cron** (if deployed on Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-training-data",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Option B: Using Upstash QStash** (you already have it configured)

```bash
# Create a schedule in Upstash dashboard
# URL: https://your-app.vercel.app/api/cron/sync-training-data
# Schedule: 0 * * * * (every hour)
# Headers: Authorization: Bearer <your-cron-secret>
```

**Option C: Manual cron on your server**
```bash
crontab -e

# Add this line (runs every hour)
0 * * * * curl -H "Authorization: Bearer your-cron-secret" https://your-app-url/api/cron/sync-training-data
```

#### Step 4: Restart Your Application
```bash
pkill -f "next dev"
pnpm dev
```

---

### PART 2: Ollama Server Setup

**Give the `OLLAMA_SERVER_INSTRUCTIONS.md` file to your AI assistant on the Ollama server.**

The AI will:
1. Install required software (Python, Flask)
2. Create training data receiver API
3. Set up automated fine-tuning script
4. Configure cron jobs
5. Test the entire pipeline

**Quick Summary for Ollama Server:**

```bash
# 1. SSH into Ollama server
ssh user@65.108.60.66

# 2. Create directory
mkdir -p /opt/jenn-learning/{training-data,models,logs,scripts}

# 3. Install dependencies
apt update && apt install -y python3 python3-pip
pip3 install flask requests schedule

# 4. Copy the Python scripts from OLLAMA_SERVER_INSTRUCTIONS.md
# - training_receiver.py
# - auto_finetune.py

# 5. Start the training receiver service
systemctl start jenn-training-receiver

# 6. Set up daily fine-tuning cron
crontab -e
# Add: 0 2 * * * /usr/bin/python3 /opt/jenn-learning/scripts/auto_finetune.py
```

---

## ✅ Testing the System

### Test 1: Check Training Data Receiver
```bash
curl -X POST http://65.108.60.66:5000/receive-training-data \
  -H "Content-Type: application/json" \
  -d '{
    "conversations": [
      {
        "messages": [
          {"role": "user", "content": "Test"},
          {"role": "assistant", "content": "Test response"}
        ]
      }
    ]
  }'
```

Expected: `{"success": true, "filename": "training_...", "count": 1}`

### Test 2: Chat with Jenn
1. Go to Email Assistant page
2. Accept learning consent
3. Send a message: "Create a rule to archive newsletters"
4. Check Ollama server logs:
```bash
tail -f /opt/jenn-learning/logs/receiver.log
```

You should see the conversation received!

### Test 3: Manual Sync Trigger
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/sync-training-data
```

### Test 4: Manual Fine-Tuning
```bash
# On Ollama server
/usr/bin/python3 /opt/jenn-learning/scripts/auto_finetune.py

# Check logs
tail -f /opt/jenn-learning/logs/finetune.log
```

---

## 🔄 Sync Modes

### Mode 1: Real-Time Sync (Recommended)
- **When**: Immediately after each conversation
- **How**: `OLLAMA_AUTO_SYNC=true` in `.env`
- **Pros**: Fastest learning, no data loss
- **Cons**: More network requests

### Mode 2: Hourly Batch Sync
- **When**: Every hour via cron
- **How**: Set up cron job to call `/api/cron/sync-training-data`
- **Pros**: Fewer requests, batched
- **Cons**: Delayed learning

### Mode 3: Hybrid (Best of Both)
- **Real-time** for important conversations
- **Hourly** for bulk sync of any missed data
- **How**: Enable both `OLLAMA_AUTO_SYNC=true` AND cron job

---

## 📊 Monitoring

### Check Sync Status
```bash
# View application logs
tail -f /root/inbox-zero/apps/web/.next/server/app/api/cron/sync-training-data/route.log

# View Ollama receiver logs
ssh user@65.108.60.66
tail -f /opt/jenn-learning/logs/receiver.log
```

### Check Training Data Count
```sql
-- In your database
SELECT COUNT(*) FROM "AiTrainingData";

-- By quality
SELECT quality, COUNT(*) 
FROM "AiTrainingData" 
GROUP BY quality;

-- Recent activity
SELECT DATE(createdAt), COUNT(*)
FROM "AiTrainingData"
WHERE createdAt > NOW() - INTERVAL '7 days'
GROUP BY DATE(createdAt);
```

### Check Model Versions
```bash
# On Ollama server
ollama list | grep jenn
```

---

## 🚨 Troubleshooting

### Issue: Data not syncing to Ollama
**Check:**
1. Ollama receiver service running:
   ```bash
   systemctl status jenn-training-receiver
   ```

2. Firewall allows port 5000:
   ```bash
   ufw status | grep 5000
   ```

3. Network connectivity:
   ```bash
   curl http://65.108.60.66:5000/health
   ```

4. Application logs for errors

### Issue: Fine-tuning not happening
**Check:**
1. Cron job configured:
   ```bash
   crontab -l | grep finetune
   ```

2. Minimum conversations met (50+):
   ```bash
   ls -la /opt/jenn-learning/training-data/*.jsonl | wc -l
   ```

3. Ollama running:
   ```bash
   systemctl status ollama
   ```

4. Fine-tuning logs:
   ```bash
   tail -100 /opt/jenn-learning/logs/finetune.log
   ```

### Issue: Model not updating in Angri
**Check:**
1. `.env` uses `jenn:latest`:
   ```env
   NEXT_PUBLIC_OLLAMA_MODEL=jenn:latest
   ```

2. Restart application after model update

3. Clear any model caches

---

## 🎓 Advanced Configuration

### Custom Fine-Tuning Schedule
```bash
# Edit cron on Ollama server
crontab -e

# Examples:
# Every 6 hours: 0 */6 * * *
# Twice daily: 0 2,14 * * *
# Weekly: 0 2 * * 0
```

### Adjust Minimum Conversations
Edit `/opt/jenn-learning/scripts/auto_finetune.py`:
```python
MIN_CONVERSATIONS = 100  # Increase for better quality
```

### Add API Key Authentication
In `.env`:
```env
OLLAMA_TRAINING_API_KEY=your-secret-api-key
```

In `training_receiver.py`:
```python
@app.route('/receive-training-data', methods=['POST'])
def receive_training_data():
    # Verify API key
    api_key = request.headers.get('X-API-Key')
    if api_key != os.getenv('EXPECTED_API_KEY'):
        return jsonify({'error': 'Unauthorized'}), 401
    # ... rest of code
```

---

## 📈 Expected Timeline

### Day 1-7: Data Collection
- Users chat with Jenn
- 50-100 conversations collected
- Data synced to Ollama server

### Day 7: First Fine-Tune
- Auto fine-tune runs at 2 AM
- Model `jenn-v20241224_0200` created
- Tagged as `jenn:latest`

### Day 8-14: Improved Performance
- Users notice better responses
- More data collected
- Quality improves

### Day 14: Second Fine-Tune
- Another fine-tune with 100+ new conversations
- Model `jenn-v20241231_0200` created
- Even smarter!

### Monthly: Continuous Improvement
- Regular fine-tuning cycles
- Model gets progressively better
- User satisfaction increases

---

## 🔒 Security Checklist

- [ ] Changed `CRON_SECRET` to random value
- [ ] Set `OLLAMA_TRAINING_API_KEY` (optional but recommended)
- [ ] Firewall configured on Ollama server
- [ ] HTTPS enabled for production
- [ ] Logs monitored for suspicious activity
- [ ] Training data backed up regularly

---

## 📝 Maintenance Tasks

### Daily
- ✅ Automated fine-tuning (2 AM)
- ✅ Automated sync (hourly or real-time)

### Weekly
- Review logs for errors
- Check model performance
- Monitor disk space

### Monthly
- Clean old processed training data
- Remove old model versions
- Review and optimize parameters
- Backup training data

---

## 🎯 Success Metrics

Track these to measure improvement:

1. **Response Quality**
   - User satisfaction
   - Fewer "I don't know" responses
   - More successful tool calls

2. **Automation Accuracy**
   - Rules created correctly
   - Fewer rule edits needed
   - Better email categorization

3. **Learning Progress**
   - Training data count growing
   - Regular fine-tuning cycles
   - Model versions increasing

4. **System Health**
   - No sync errors
   - Fine-tuning completing successfully
   - Logs clean

---

## 🚀 Quick Start Checklist

### Angri Application
- [ ] Run `./setup-ai-learning.sh`
- [ ] Update `CRON_SECRET` in `.env`
- [ ] Set `OLLAMA_AUTO_SYNC=true`
- [ ] Restart application
- [ ] Test consent banner appears

### Ollama Server
- [ ] Give `OLLAMA_SERVER_INSTRUCTIONS.md` to AI
- [ ] AI sets up receiver service
- [ ] AI sets up fine-tuning script
- [ ] AI configures cron jobs
- [ ] Test receiver endpoint

### Testing
- [ ] Chat with Jenn
- [ ] Check data synced to Ollama
- [ ] Wait for first fine-tune (or trigger manually)
- [ ] Verify new model created
- [ ] Test improved responses

---

## 📞 Support

If you encounter issues:

1. Check logs (both Angri and Ollama)
2. Verify network connectivity
3. Test each component individually
4. Review this guide's troubleshooting section

---

**Your AI will now learn and improve automatically every day!** 🚀🧠

The more users chat with Jenn, the smarter she becomes!
