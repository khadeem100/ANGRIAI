# Voice AI Quick Start 🎤

Get voice conversations running in 5 minutes!

## Step 1: Get API Keys (2 minutes)

### Deepgram (Speech-to-Text)
```bash
# 1. Go to: https://console.deepgram.com/signup
# 2. Create account (free $200 credit)
# 3. Create a project
# 4. Copy your API key
```

### ElevenLabs (Text-to-Speech)
```bash
# 1. Go to: https://elevenlabs.io/sign-up
# 2. Create account (free 10,000 characters/month)
# 3. Go to Profile → API Keys
# 4. Copy your API key
```

## Step 2: Add to .env (1 minute)

```bash
# Add these to your .env file:
DEEPGRAM_API_KEY=your_deepgram_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

## Step 3: Install & Run (2 minutes)

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Step 4: Test Voice Chat! 🎉

1. Open your app at `http://localhost:3000`
2. Navigate to the AI Assistant chat
3. Click the **gear icon** (⚙️) in top right
4. Toggle **"Enable Voice Mode"** ON
5. Click **"Talk to me"** button
6. Speak your question
7. Click again to stop and send
8. Listen to Angri's voice response!

---

## How to Use

### Basic Voice Conversation
1. **Click "Talk to me"** → Start speaking
2. **Click again** → Stop recording & send
3. **AI responds** → Hear the answer automatically

### Change Voice
1. Click **gear icon** (⚙️)
2. Select a different voice from dropdown
3. Try Rachel (professional), Adam (authoritative), or Elli (friendly)

### Disable Voice
1. Click **gear icon** (⚙️)
2. Toggle **"Enable Voice Mode"** OFF
3. Chat returns to text-only mode

---

## What You Get

✅ **Real-time voice conversations** with AI  
✅ **8 professional voices** to choose from  
✅ **Works with all AI providers** (OpenAI, Anthropic, Google, Groq, etc.)  
✅ **Live actions** - AI can trigger integrations while talking  
✅ **Visual feedback** - See waveforms during conversation  
✅ **Auto-speak responses** - No manual playback needed  

---

## Costs

### Free Tier (Testing)
- **Deepgram**: $200 free credit (~46,000 minutes)
- **ElevenLabs**: 10,000 characters/month free (~3-5 minutes)

### Production Pricing
- **Deepgram**: $0.0043/minute (~$0.26/hour)
- **ElevenLabs**: $0.30/minute (~$18/hour)
- **Total**: ~$0.31/minute or ~$18.26/hour

### Recommended Plan
Charge users $10-20/month for voice mode to cover costs and profit.

---

## Troubleshooting

**"Microphone permission denied"**  
→ Allow microphone access in browser settings

**"No voice API keys"**  
→ Check your `.env` file has both keys  
→ Restart your dev server after adding keys

**"No audio playing"**  
→ Check browser volume is not muted  
→ Try a different browser (Chrome recommended)

**"Transcription failed"**  
→ Verify Deepgram API key is correct  
→ Check your Deepgram account has credits

**"Synthesis failed"**  
→ Verify ElevenLabs API key is correct  
→ Check your ElevenLabs account has characters left

---

## Next Steps

📖 Read full documentation: `VOICE_AI_SETUP.md`  
🚀 Deploy to production with env vars  
💰 Set up billing for Deepgram & ElevenLabs  
🎨 Customize voices and settings  
📊 Monitor usage and costs  

---

## Support

Need help? Check:
- Full setup guide: `VOICE_AI_SETUP.md`
- Deepgram docs: https://developers.deepgram.com
- ElevenLabs docs: https://elevenlabs.io/docs

Enjoy talking to Angri! 🎉
