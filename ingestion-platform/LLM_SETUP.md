# 🚀 LLM Setup Guide

## Recommended: Gemini 2.0 Flash

**Best balance of cost and quality for your use case.**

### Get Your API Key

1. Go to: https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy your key

### Add to `.env`

```bash
GOOGLE_API_KEY=your-key-here
```

### Cost Estimate

- **Per 1,000 articles**: ~$0.045
- **Per 10,000 articles**: ~$0.45
- **Per month (1,000/day)**: ~$1.35

## Alternative Options

### Mistral Small 3.1 (Cheapest)

**Cost**: ~$0.025 per 1,000 articles

1. Sign up: https://console.mistral.ai/
2. Get API key
3. Add to `.env`:
```bash
MISTRAL_API_KEY=your-key-here
```

### Mistral Medium 3 (Better Quality)

**Cost**: ~$0.14 per 1,000 articles

Same setup as above, but code will auto-use Medium if you prefer.

### OpenAI GPT-3.5 (More Expensive)

**Cost**: ~$0.20 per 1,000 articles

1. Get key from: https://platform.openai.com/api-keys
2. Add to `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

## How It Works

The system will automatically:
1. **Try Gemini first** (if key is set)
2. **Fallback to Mistral** (if Gemini fails)
3. **Fallback to OpenAI** (if others fail)
4. **Use mock** (if no keys set)

## After Adding Key

1. Restart the worker:
```bash
pkill -f "node.*dist/worker"
npm run worker
```

2. Trigger a rewrite job:
```bash
curl -X POST http://localhost:3000/api/jobs/run \
  -H "Content-Type: application/json" \
  -d '{"sourceId": "inshorts"}'
```

3. Check the feed - titles should be rewritten without `[AI]` prefix!

## Testing

After adding your API key, you can test by:
1. Triggering a new ingestion job
2. Waiting for rewrite stage to complete
3. Checking feed - rewritten titles should be natural, not prefixed
