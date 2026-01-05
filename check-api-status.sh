#!/bin/bash

# Simple script to check API deployment status

PROJECT_ID="gen-lang-client-0803362165"
REGION="asia-south1"
SERVICE="whatsay-api"

echo "⏳ Checking API deployment status..."
echo ""

# Check if service exists
gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format="yaml(status)" 2>&1

echo ""
echo "---"
echo ""

# Get URL if available
URL=$(gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format="value(status.url)" 2>/dev/null)

if [ -n "$URL" ] && [ "$URL" != "" ]; then
  echo "✅ API DEPLOYED!"
  echo "URL: $URL"
  echo ""
  echo "Testing health endpoint..."
  curl -s "$URL/health" || echo "Health check failed"
else
  echo "⏳ API still deploying or not found"
  echo ""
  echo "Check build status:"
  gcloud builds list --limit=1 --project="$PROJECT_ID" --format="table(id,status,createTime)"
fi
