#!/bin/bash

echo "🔍 Checking API Deployment Status..."
echo ""

# Check if API service exists
echo "Checking for whatsay-api service..."
URL=$(gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)" 2>&1)

if [ $? -eq 0 ] && [ -n "$URL" ] && [ "$URL" != "" ]; then
  echo "✅ API DEPLOYMENT COMPLETE!"
  echo "URL: $URL"
  echo ""
  echo "Testing health endpoint..."
  curl -s "$URL/health" && echo "" || echo "Health check failed"
  echo ""
  echo "✅ Ready for next steps!"
else
  echo "⏳ API not deployed yet or still building"
  echo ""
  echo "Checking build status..."
  gcloud builds list \
    --limit=1 \
    --project gen-lang-client-0803362165 \
    --format="table(id,status,createTime)"
  echo ""
  echo "If status is 'SUCCESS', the deployment should be ready soon."
  echo "If status is 'FAILURE', check logs with:"
  echo "  gcloud builds log <BUILD_ID> --project gen-lang-client-0803362165"
fi
