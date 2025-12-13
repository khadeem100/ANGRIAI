# Voice AI Setup Guide

Angri now supports **real-time voice conversations** with AI! Users can speak to Angri and receive spoken responses with live actions.

## Architecture

### Option 3: Hybrid Voice AI (Implemented)
- **Deepgram**: Real-time speech-to-text transcription
- **Your AI Provider**: Process with any LLM (OpenAI, Anthropic, Google, Groq, etc.)
- **ElevenLabs**: High-quality text-to-speech synthesis

This approach gives you:
- ✅ Multi-provider flexibility (works with all AI providers)
- ✅ Premium voice quality (ElevenLabs)
- ✅ Fast transcription (Deepgram)
- ✅ Real-time conversations with ~500-800ms latency

---

## Setup Instructions

### 1. Get API Keys

#### Deepgram (Speech-to-Text)
1. Sign up at [https://deepgram.com](https://deepgram.com)
2. Create a new project
3. Generate an API key
4. Pricing: ~$0.0043/minute (very affordable)

#### ElevenLabs (Text-to-Speech)
1. Sign up at [https://elevenlabs.io](https://elevenlabs.io)
2. Go to Profile → API Keys
3. Generate a new API key
4. Pricing: ~$0.30/minute (professional quality)

### 2. Add Environment Variables

Add to your `.env` file:

```bash
# Voice AI
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Install Dependencies

```bash
pnpm install
```

This will install:
- `@deepgram/sdk` - Deepgram client
- `elevenlabs` - ElevenLabs client

### 4. Deploy

Deploy your application with the new environment variables set in your hosting platform.

---

## How It Works

### User Flow

1. **User clicks "Talk to me"** button in chat
2. **Browser captures audio** via microphone
3. **Audio sent to Deepgram** for transcription
4. **Transcript sent to AI** (your configured LLM provider)
5. **AI response streamed back** to user
6. **Response sent to ElevenLabs** for synthesis
7. **Audio played back** to user

### Technical Flow

```
User Microphone
    ↓
MediaRecorder API (Browser)
    ↓
/api/voice/transcribe (Deepgram)
    ↓
Transcript → Chat Input
    ↓
/api/chat (Your AI Provider)
    ↓
AI Response
    ↓
/api/voice/synthesize (ElevenLabs)
    ↓
Audio Playback (Browser)
```

---

## Features

### Voice Button
- **Idle**: Shows microphone icon
- **Listening**: Red pulsing microphone (recording)
- **Processing**: Spinner (transcribing)
- **Speaking**: Blue pulsing speaker (AI talking)

### Voice Settings
- **Enable/Disable**: Toggle voice mode on/off
- **Voice Selection**: Choose from 8 professional voices
  - Rachel (calm, professional female)
  - Adam (deep, authoritative male)
  - Domi (strong, confident female)
  - Elli (energetic, friendly female)
  - Josh (young, casual male)
  - Arnold (crisp, clear male)
  - Antoni (well-rounded, versatile male)
  - Thomas (mature, calm male)

### Voice Visualizer
- Animated waveform during listening/speaking
- Visual feedback for voice activity

### Auto-Speak Responses
- When voice mode is enabled, AI responses are automatically spoken
- No need to manually trigger playback

---

## API Endpoints

### POST `/api/voice/transcribe`
Transcribe audio to text using Deepgram.

**Request:**
```typescript
FormData {
  audio: File (webm format)
}
```

**Response:**
```json
{
  "transcript": "Hello, how can you help me today?"
}
```

### POST `/api/voice/synthesize`
Convert text to speech using ElevenLabs.

**Request:**
```json
{
  "text": "I can help you manage your inbox!",
  "voiceId": "rachel"
}
```

**Response:**
```
audio/mpeg stream
```

### GET `/api/voice/voices`
Get available voices.

**Response:**
```json
{
  "voices": [
    { "id": "21m00Tcm4TlvDq8ikWAM", "name": "rachel", "displayName": "Rachel" },
    ...
  ]
}
```

---

## Cost Estimates

### Per-Minute Costs
- **Deepgram**: $0.0043/min
- **Your LLM**: $0.003-0.015/min (varies by provider)
- **ElevenLabs**: $0.30/min
- **Total**: ~$0.31/min

### Monthly Estimates (100 users, 30 min/month each)
- **Total minutes**: 3,000 min/month
- **Deepgram**: ~$13/month
- **LLM**: ~$9-45/month
- **ElevenLabs**: ~$900/month
- **Total**: ~$922-958/month

### Cost Optimization Tips
1. **Cache common responses** to avoid re-synthesizing
2. **Limit voice message length** (e.g., max 500 words)
3. **Offer voice as premium feature** ($10-20/month)
4. **Use browser TTS for free tier** (fallback option)

---

## Browser Compatibility

### Required Features
- **MediaRecorder API**: Chrome, Edge, Safari, Firefox
- **Web Audio API**: All modern browsers
- **Fetch API with streaming**: All modern browsers

### Recommended Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+

---

## Troubleshooting

### "Microphone permission denied"
- User needs to grant microphone access
- Check browser permissions in settings

### "DEEPGRAM_API_KEY is not set"
- Ensure environment variable is set
- Restart your development server

### "ELEVENLABS_API_KEY is not set"
- Ensure environment variable is set
- Restart your development server

### "No audio playing"
- Check browser audio permissions
- Ensure volume is not muted
- Check browser console for errors

### "Transcription is slow"
- Check network connection
- Deepgram should respond in <500ms
- Consider upgrading Deepgram plan

### "Voice quality is poor"
- ElevenLabs uses highest quality by default
- Check audio playback device
- Ensure stable internet connection

---

## Future Enhancements

### Planned Features
1. **Voice commands**: "Archive this email", "Reply yes"
2. **Interruption support**: Stop AI mid-sentence
3. **Multi-language**: Support for 20+ languages
4. **Voice cloning**: Clone user's voice for personalization
5. **Conversation memory**: Remember voice conversation context
6. **Voice analytics**: Track usage, quality, satisfaction

### Alternative Implementations
- **OpenAI Realtime API**: For OpenAI-only users (lower latency)
- **Browser Web Speech API**: Free fallback for basic voice
- **Whisper + Local TTS**: Self-hosted option

---

## Security & Privacy

### Data Handling
- **Audio data**: Sent to Deepgram, not stored by Angri
- **Transcripts**: Stored in chat history (encrypted)
- **Voice responses**: Generated on-demand, not cached
- **API keys**: Stored securely in environment variables

### Compliance
- **GDPR**: Audio processing happens in real-time, not stored
- **HIPAA**: Do not use for healthcare data without BAA
- **SOC 2**: Deepgram and ElevenLabs are SOC 2 compliant

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Deepgram docs: [https://developers.deepgram.com](https://developers.deepgram.com)
3. Review ElevenLabs docs: [https://elevenlabs.io/docs](https://elevenlabs.io/docs)
4. Open an issue on GitHub

---

## Credits

- **Deepgram**: Speech-to-text transcription
- **ElevenLabs**: Text-to-speech synthesis
- **Vercel AI SDK**: AI chat infrastructure
