#!/bin/bash
# =============================================================================
# WhatSay Image Pipeline - Production GCS Setup
# Staff Engineer Grade Infrastructure Script
# =============================================================================
#
# This script:
# 1. Creates GCS bucket with proper permissions
# 2. Generates HMAC credentials for S3-compatible access
# 3. Creates/updates Cloud Run secrets
# 4. Validates configuration
# 5. Triggers worker to process pending images
#
# Prerequisites:
# - gcloud CLI authenticated with project owner/editor permissions
# - gsutil available
#
# Usage:
#   chmod +x scripts/setup-gcs-pipeline.sh
#   ./scripts/setup-gcs-pipeline.sh
#
# =============================================================================

set -e  # Exit on error

# Configuration
PROJECT_ID="gen-lang-client-0803362165"
REGION="asia-south1"
BUCKET_NAME="whatsay-content"
SERVICE_NAME="whatsay-api"
WORKER_JOB_NAME="whatsay-worker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Step 0: Validate Prerequisites
# =============================================================================
log_info "Validating prerequisites..."

if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI not found. Install: https://cloud.google.com/sdk/install"
    exit 1
fi

if ! command -v gsutil &> /dev/null; then
    log_error "gsutil not found. Install: https://cloud.google.com/storage/docs/gsutil_install"
    exit 1
fi

# Verify project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    log_warn "Current project is $CURRENT_PROJECT, switching to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi

log_success "Prerequisites validated"

# =============================================================================
# Step 1: Create GCS Bucket
# =============================================================================
log_info "Checking GCS bucket gs://$BUCKET_NAME..."

if gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
    log_success "Bucket already exists"
else
    log_info "Creating bucket..."
    gsutil mb -l $REGION -p $PROJECT_ID gs://$BUCKET_NAME
    log_success "Bucket created"
fi

# Set public read access for serving images
log_info "Setting bucket permissions (public read for images)..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
log_success "Bucket permissions configured"

# Set CORS for web access
log_info "Configuring CORS..."
cat > /tmp/cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set /tmp/cors.json gs://$BUCKET_NAME
rm /tmp/cors.json
log_success "CORS configured"

# =============================================================================
# Step 2: Generate HMAC Credentials
# =============================================================================
log_info "Checking for existing HMAC keys..."

# Get service account email
SERVICE_ACCOUNT=$(gcloud iam service-accounts list --format="value(email)" --filter="displayName:Default compute service account" | head -1)
if [ -z "$SERVICE_ACCOUNT" ]; then
    SERVICE_ACCOUNT=$(gcloud iam service-accounts list --format="value(email)" | head -1)
fi

log_info "Using service account: $SERVICE_ACCOUNT"

# Check for existing HMAC key
EXISTING_KEY=$(gsutil hmac list -u $SERVICE_ACCOUNT 2>/dev/null | grep "ACTIVE" | head -1 | awk '{print $1}')

if [ -n "$EXISTING_KEY" ]; then
    log_warn "Active HMAC key exists: $EXISTING_KEY"
    log_warn "To create a new key, first deactivate the existing one."
    read -p "Create new HMAC key anyway? (y/N): " CREATE_NEW
    if [ "$CREATE_NEW" != "y" ] && [ "$CREATE_NEW" != "Y" ]; then
        log_info "Skipping HMAC key creation. Using existing key."
        S3_ACCESS_KEY="<use-existing-key>"
        S3_SECRET_KEY="<use-existing-secret>"
    else
        log_info "Creating new HMAC key..."
        HMAC_OUTPUT=$(gsutil hmac create $SERVICE_ACCOUNT 2>&1)
        S3_ACCESS_KEY=$(echo "$HMAC_OUTPUT" | grep "Access ID:" | awk '{print $3}')
        S3_SECRET_KEY=$(echo "$HMAC_OUTPUT" | grep "Secret:" | awk '{print $2}')
    fi
else
    log_info "Creating HMAC key..."
    HMAC_OUTPUT=$(gsutil hmac create $SERVICE_ACCOUNT 2>&1)
    S3_ACCESS_KEY=$(echo "$HMAC_OUTPUT" | grep "Access ID:" | awk '{print $3}')
    S3_SECRET_KEY=$(echo "$HMAC_OUTPUT" | grep "Secret:" | awk '{print $2}')
fi

if [ "$S3_ACCESS_KEY" != "<use-existing-key>" ]; then
    log_success "HMAC credentials generated"
    echo ""
    echo -e "${YELLOW}=== SAVE THESE CREDENTIALS ===${NC}"
    echo -e "Access Key: ${GREEN}$S3_ACCESS_KEY${NC}"
    echo -e "Secret Key: ${GREEN}$S3_SECRET_KEY${NC}"
    echo -e "${YELLOW}================================${NC}"
    echo ""
fi

# =============================================================================
# Step 3: Create/Update Cloud Run Secrets
# =============================================================================
log_info "Configuring Cloud Run secrets..."

create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    if gcloud secrets describe $SECRET_NAME &> /dev/null; then
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
        log_info "Updated secret: $SECRET_NAME"
    else
        gcloud secrets create $SECRET_NAME --replication-policy="automatic"
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
        log_info "Created secret: $SECRET_NAME"
    fi
}

# Only update if we have new credentials
if [ "$S3_ACCESS_KEY" != "<use-existing-key>" ]; then
    create_or_update_secret "s3-endpoint" "https://storage.googleapis.com"
    create_or_update_secret "s3-access-key" "$S3_ACCESS_KEY"
    create_or_update_secret "s3-secret-key" "$S3_SECRET_KEY"
    create_or_update_secret "s3-bucket" "$BUCKET_NAME"
    create_or_update_secret "s3-public-base-url" "https://storage.googleapis.com/$BUCKET_NAME"
    create_or_update_secret "s3-region" "auto"
    log_success "Secrets configured"
else
    log_warn "Skipping secret updates (using existing credentials)"
fi

# =============================================================================
# Step 4: Update Cloud Run Service with Secrets
# =============================================================================
log_info "Updating Cloud Run service with secrets..."

gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --update-secrets="S3_ENDPOINT=s3-endpoint:latest,S3_ACCESS_KEY=s3-access-key:latest,S3_SECRET_KEY=s3-secret-key:latest,S3_BUCKET=s3-bucket:latest,S3_PUBLIC_BASE_URL=s3-public-base-url:latest,S3_REGION=s3-region:latest" \
    --quiet

log_success "Cloud Run service updated"

# =============================================================================
# Step 5: Validate Configuration
# =============================================================================
log_info "Validating configuration..."

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

# Test health endpoint
log_info "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/health" 2>/dev/null || echo "{}")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    log_success "Health check passed"
else
    log_warn "Health check returned: $HEALTH_RESPONSE"
fi

# =============================================================================
# Step 6: Trigger Worker to Process Pending Images
# =============================================================================
log_info "Checking if worker job exists..."

if gcloud run jobs describe $WORKER_JOB_NAME --region $REGION &> /dev/null; then
    log_info "Triggering worker job to process pending images..."
    gcloud run jobs execute $WORKER_JOB_NAME --region $REGION --async
    log_success "Worker job triggered (async)"
else
    log_warn "Worker job '$WORKER_JOB_NAME' not found. Create it first."
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=============================================="
echo -e "${GREEN}Image Pipeline Setup Complete${NC}"
echo "=============================================="
echo ""
echo "Bucket:      gs://$BUCKET_NAME"
echo "Public URL:  https://storage.googleapis.com/$BUCKET_NAME"
echo "Service:     $SERVICE_URL"
echo ""
echo "Next Steps:"
echo "  1. Verify worker job is running: gcloud run jobs executions list --job=$WORKER_JOB_NAME --region=$REGION"
echo "  2. Check logs: gcloud run jobs logs read $WORKER_JOB_NAME --region=$REGION"
echo "  3. Test image upload by triggering ingestion"
echo ""
