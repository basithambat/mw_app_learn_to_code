#!/bin/bash

PROJECT_ID="gen-lang-client-0803362165"

echo "🗑️  Cleaning up US resources (us-central1)..."
echo "⚠️  This will DELETE all resources in us-central1"
echo ""

read -p "Are you sure? Type 'DELETE' to confirm: " confirm
if [ "$confirm" != "DELETE" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Deleting Redis in us-central1..."
gcloud redis instances delete whatsay-redis \
  --region us-central1 \
  --project $PROJECT_ID \
  --quiet 2>&1 || echo "Redis already deleted or doesn't exist"

echo ""
echo "Deleting Cloud SQL in us-central1..."
echo "⚠️  WARNING: This deletes ALL database data!"
gcloud sql instances delete whatsay-db \
  --project $PROJECT_ID \
  --quiet 2>&1 || echo "Cloud SQL already deleted or doesn't exist"

echo ""
echo "Checking storage bucket location..."
BUCKET_LOCATION=$(gsutil ls -L -b gs://whatsay-content 2>/dev/null | grep "Location constraint" | awk '{print $3}' || echo "")
if [ "$BUCKET_LOCATION" = "US" ] || [ "$BUCKET_LOCATION" = "us-central1" ]; then
    echo "Deleting storage bucket in US..."
    gsutil rm -r gs://whatsay-content 2>/dev/null || echo "Bucket already deleted"
else
    echo "Bucket is in $BUCKET_LOCATION, keeping it"
fi

echo ""
echo "✅ Cleanup complete!"
echo "💰 You're no longer being charged for US resources"
