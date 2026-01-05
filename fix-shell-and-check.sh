#!/bin/bash
# Bypass zsh and use bash directly to avoid shell config issues

# Set up gcloud path
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Check API deployment
echo "🔍 Checking API Deployment Status..."
echo ""

PROJECT_ID="gen-lang-client-0803362165"
REGION="asia-south1"
SERVICE="whatsay-api"

# Check if service exists
URL=$(gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format="value(status.url)" 2>&1)

if [ $? -eq 0 ] && [ -n "$URL" ] && [ "$URL" != "" ]; then
  echo "✅ API DEPLOYMENT COMPLETE!"
  echo "URL: $URL"
  echo ""
  echo "Testing health endpoint..."
  curl -s "$URL/health" && echo "" || echo "Health check failed"
  echo ""
  echo "✅ Ready for next steps!"
  exit 0
else
  echo "⏳ API not deployed yet or still building"
  echo ""
  echo "Checking build status..."
  gcloud builds list \
    --limit=1 \
    --project "$PROJECT_ID" \
    --format="table(id,status,createTime)" 2>&1
  exit 1
fi
