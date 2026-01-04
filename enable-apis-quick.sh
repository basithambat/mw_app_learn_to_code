#!/bin/bash

# Quick API Enablement Script
# Run this AFTER enabling Service Usage API manually in console

PROJECT_ID="gen-lang-client-0803362165"

echo "🔌 Enabling Required APIs..."
echo ""

# Enable all APIs at once
gcloud services enable \
    serviceusage.googleapis.com \
    cloudresourcemanager.googleapis.com \
    sqladmin.googleapis.com \
    redis.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    storage-component.googleapis.com \
    compute.googleapis.com \
    vpcaccess.googleapis.com \
    cloudbuild.googleapis.com \
    --project="$PROJECT_ID"

echo ""
echo "✅ APIs enabled! Waiting 30 seconds for propagation..."
sleep 30

echo ""
echo "✅ Ready! Now run: ./setup-gcp-cost-optimized.sh"
