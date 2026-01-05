#!/usr/bin/env bash
# Direct API check bypassing shell issues

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

gcloud run services describe whatsay-api \
  --region asia-south1 \
  --project gen-lang-client-0803362165 \
  --format="value(status.url)" 2>&1
