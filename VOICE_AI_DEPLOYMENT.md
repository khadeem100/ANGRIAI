# Voice AI Deployment Checklist

## Pre-Deployment

### 1. Install Dependencies ✅
```bash
cd /root/inbox-zero/apps/web
pnpm install
```

This installs:
- `@deepgram/sdk@^3.8.0`
- `elevenlabs@^0.18.3`

### 2. Get API Keys 🔑

#### Deepgram
1. Go to: https://console.deepgram.com/signup
2. Sign up (free $200 credit)
3. Create a new project
4. Navigate to API Keys
5. Create a new key
6. Copy the key (starts with `sk_...`)

#### ElevenLabs
1. Go to: https://elevenlabs.io/sign-up
2. Sign up (free 10,000 chars/month)
3. Go to Profile → API Keys
4. Generate new API key
5. Copy the key

### 3. Local Testing 🧪

Add to `.env`:
```bash
DEEPGRAM_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Run locally:
```bash
pnpm dev
```

Test:
1. Open http://localhost:3000
2. Navigate to AI Assistant
3. Click gear icon → Enable voice mode
4. Click "Talk to me"
5. Speak and verify transcription
6. Verify AI responds with voice

---

## Production Deployment

### 1. Environment Variables

Add to your hosting platform (Vercel, Railway, etc.):

```bash
# Voice AI
DEEPGRAM_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Vercel Deployment

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod

# Or via GitHub push (if connected)
git add .
git commit -m "Add voice AI conversation system"
git push origin main
```

### 3. Set Environment Variables in Vercel

Via CLI:
```bash
vercel env add DEEPGRAM_API_KEY production
# Paste your key when prompted

vercel env add ELEVENLABS_API_KEY production
# Paste your key when prompted
```

Via Dashboard:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add `DEEPGRAM_API_KEY` (production)
5. Add `ELEVENLABS_API_KEY` (production)
6. Redeploy

### 4. Other Platforms

#### Railway
```bash
railway variables set DEEPGRAM_API_KEY=sk_xxx
railway variables set ELEVENLABS_API_KEY=xxx
railway up
```

#### Render
1. Dashboard → Environment
2. Add `DEEPGRAM_API_KEY`
3. Add `ELEVENLABS_API_KEY`
4. Deploy

#### Docker
```dockerfile
# In your docker-compose.yml or Dockerfile
ENV DEEPGRAM_API_KEY=sk_xxx
ENV ELEVENLABS_API_KEY=xxx
```

---

## Post-Deployment Testing

### 1. Verify Deployment ✅
- [ ] Site loads successfully
- [ ] No build errors
- [ ] Environment variables set

### 2. Test Voice Features ✅
- [ ] Voice button appears in chat
- [ ] Microphone permission prompt works
- [ ] Recording starts on click
- [ ] Transcription works
- [ ] AI responds correctly
- [ ] Voice synthesis works
- [ ] Audio plays automatically
- [ ] Voice settings persist

### 3. Test Different Browsers ✅
- [ ] Chrome/Edge (recommended)
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 4. Test Error Handling ✅
- [ ] Microphone permission denied
- [ ] Network error during transcription
- [ ] Network error during synthesis
- [ ] Invalid API keys
- [ ] Rate limit handling

---

## Monitoring Setup

### 1. Deepgram Dashboard
1. Go to: https://console.deepgram.com
2. Monitor usage under "Usage"
3. Set up billing alerts
4. Track API calls

### 2. ElevenLabs Dashboard
1. Go to: https://elevenlabs.io/app/usage
2. Monitor character usage
3. Set up billing alerts
4. Track API calls

### 3. Application Monitoring
Add to your monitoring:
- Voice conversation count
- Transcription success rate
- Synthesis success rate
- Average latency
- Error rates

---

## Cost Management

### 1. Set Billing Alerts

#### Deepgram
1. Console → Billing
2. Set alert at $50, $100, $200
3. Add payment method

#### ElevenLabs
1. Settings → Billing
2. Set usage alerts
3. Add payment method

### 2. Usage Limits (Optional)

Add rate limiting to API routes:

```typescript
// In /api/voice/transcribe/route.ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

// Check rate limit before processing
const { success } = await ratelimit.limit(emailAccountId);
if (!success) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

### 3. User Quotas

Track usage per user:
```typescript
// Store in database
interface VoiceUsage {
  userId: string;
  minutesUsed: number;
  monthlyLimit: number; // e.g., 30 minutes for free tier
}
```

---

## Pricing Strategy

### Recommended Tiers

#### Free Tier
- 5 minutes voice/month
- All text features
- Basic voices only

#### Pro Tier ($10/month)
- 30 minutes voice/month
- All voices
- Priority support

#### Business Tier ($20/month)
- 100 minutes voice/month
- Custom voices
- API access

### Cost Calculation
```
User pays: $10/month
Your cost: ~$9.30 (30 min × $0.31/min)
Profit: $0.70/user/month

At 100 users: $70/month profit
At 1,000 users: $700/month profit
```

---

## Troubleshooting Production

### Issue: "Voice not working in production"
**Solution:**
1. Check environment variables are set
2. Verify HTTPS is enabled (required for microphone)
3. Check browser console for errors
4. Verify API keys are valid

### Issue: "High latency"
**Solution:**
1. Check Deepgram region (use closest to users)
2. Optimize audio chunk size
3. Use ElevenLabs Turbo model (already configured)
4. Consider CDN for audio delivery

### Issue: "Costs too high"
**Solution:**
1. Implement rate limiting
2. Add user quotas
3. Cache common responses
4. Limit voice message length
5. Offer voice as premium feature

### Issue: "API rate limits"
**Solution:**
1. Upgrade Deepgram plan
2. Upgrade ElevenLabs plan
3. Implement queuing system
4. Add retry logic with backoff

---

## Security Checklist

- [ ] API keys in environment variables (not code)
- [ ] HTTPS enabled for production
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive data
- [ ] CORS configured correctly
- [ ] Authentication required for voice endpoints
- [ ] Audio data not logged or stored

---

## Rollback Plan

If issues occur:

### Quick Disable
1. Remove voice components from chat UI
2. Deploy without voice features
3. Investigate issues

### Environment Variable Disable
```bash
# Set to empty to disable
DEEPGRAM_API_KEY=
ELEVENLABS_API_KEY=
```

### Code Disable
Comment out voice imports in `chat.tsx`:
```typescript
// import { useVoiceChat } from "@/hooks/useVoiceChat";
// import { VoiceButton } from "@/components/voice/VoiceButton";
```

---

## Success Metrics

Track these KPIs:

### Usage Metrics
- Daily active voice users
- Average conversation length
- Voice vs text usage ratio
- Repeat usage rate

### Quality Metrics
- Transcription accuracy
- Voice synthesis quality (user feedback)
- Average latency
- Error rate

### Business Metrics
- Voice feature adoption rate
- Upgrade to paid tier (for voice)
- Cost per user
- Revenue per voice user

---

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch error rates
   - Check API usage
   - Monitor costs

2. **Gather user feedback**
   - Add feedback button
   - Track satisfaction
   - Collect feature requests

3. **Optimize based on data**
   - Reduce latency
   - Improve voice quality
   - Add requested features

4. **Scale gradually**
   - Start with beta users
   - Expand to all users
   - Monitor costs closely

---

## Support Contacts

- **Deepgram Support**: support@deepgram.com
- **ElevenLabs Support**: support@elevenlabs.io
- **Documentation**: See VOICE_AI_SETUP.md

---

## 🎉 You're Ready!

Your voice AI system is production-ready. Deploy with confidence!

**Remember:**
- Start with small user group
- Monitor costs closely
- Gather feedback early
- Iterate based on data

**Good luck! 🚀**
