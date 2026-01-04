#!/bin/bash

# GCP Setup Using Service Account Key (Non-Interactive)
# This allows me to run the setup automatically

set -e

PROJECT_ID="gen-lang-client-0803362165"
PROJECT_NUMBER="278662370606"
SERVICE_ACCOUNT_KEY_FILE="${1:-service-account-key.json}"

if [ ! -f "$SERVICE_ACCOUNT_KEY_FILE" ]; then
    echo "❌ Service account key file not found: $SERVICE_ACCOUNT_KEY_FILE"
    echo ""
    echo "To create a service account key:"
    echo "1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=$PROJECT_ID"
    echo "2. Create Service Account: 'whatsay-setup'"
    echo "3. Grant these roles:"
    echo "   - roles/owner (or individual roles below)"
    echo "   - roles/cloudsql.admin"
    echo "   - roles/redis.admin"
    echo "   - roles/run.admin"
    echo "   - roles/storage.admin"
    echo "   - roles/secretmanager.admin"
    echo "   - roles/compute.networkAdmin"
    echo "   - roles/serviceusage.serviceUsageAdmin"
    echo "4. Create Key (JSON) and save as: service-account-key.json"
    echo ""
    echo "Then run:"
    echo "  ./setup-gcp-with-service-account.sh service-account-key.json"
    exit 1
fi

echo "🔐 Authenticating with service account..."
gcloud auth activate-service-account --key-file="$SERVICE_ACCOUNT_KEY_FILE" --project="$PROJECT_ID"

echo "✅ Authenticated"
echo ""

# Now run the main setup script
./setup-gcp-with-project.sh "$PROJECT_ID"
