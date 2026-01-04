#!/bin/bash

# GCP Infrastructure Setup - INDIA REGION (asia-south1 Mumbai)
# Optimized for India-first deployment

set -e

PROJECT_ID="gen-lang-client-0803362165"
PROJECT_NUMBER="278662370606"
REGION="asia-south1"  # Mumbai, India - best for India users
ZONE="${REGION}-a"

# Resource names
DB_INSTANCE="whatsay-db"
DB_NAME="ingestion_db"
DB_USER="app_user"
REDIS_INSTANCE="whatsay-redis"
BUCKET_NAME="whatsay-content"
VPC_CONNECTOR="whatsay-connector"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

echo "🇮🇳 GCP Infrastructure Setup - INDIA REGION (Mumbai)"
echo "Project: $PROJECT_ID"
echo "Region: $REGION (Mumbai, India)"
echo "Optimized for India-first deployment"
echo ""

# Set project
gcloud config set project "$PROJECT_ID" 2>/dev/null || true

# Check if old resources exist in us-central1
echo "Checking for existing resources in us-central1..."
US_RESOURCES_FOUND=0

if gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
    OLD_REGION=$(gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" --format="value(region)" 2>/dev/null)
    if [ "$OLD_REGION" != "$REGION" ]; then
        print_warning "⚠️  Cloud SQL exists in $OLD_REGION"
        print_warning "⚠️  You'll be charged for BOTH regions if you don't delete the old one!"
        US_RESOURCES_FOUND=1
    fi
fi

if gcloud redis instances describe "$REDIS_INSTANCE" --region=us-central1 --project="$PROJECT_ID" &>/dev/null; then
    print_warning "⚠️  Redis exists in us-central1"
    print_warning "⚠️  You'll be charged for BOTH regions if you don't delete the old one!"
    US_RESOURCES_FOUND=1
fi

if [ $US_RESOURCES_FOUND -eq 1 ]; then
    echo ""
    print_warning "💰 COST WARNING: Keeping both regions will DOUBLE your costs!"
    echo "   US resources: ~\$36/month"
    echo "   Mumbai resources: ~\$36/month"
    echo "   Total: ~\$72/month (vs ~\$36/month for Mumbai only)"
    echo ""
    echo "Recommended: Delete US resources first to avoid double charges"
    echo "Run: ./cleanup-us-resources.sh"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. Delete US resources first, then run this script again."
        exit 1
    fi
fi

# Generate secure passwords
DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_APP_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create Cloud SQL - COST OPTIMIZED (FREE TIER)
echo ""
echo "🗄️  Creating Cloud SQL (PostgreSQL) in $REGION..."
if gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
    CURRENT_REGION=$(gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" --format="value(region)" 2>/dev/null)
    if [ "$CURRENT_REGION" = "$REGION" ]; then
        print_status "Cloud SQL instance already exists in $REGION"
        CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID" 2>/dev/null || echo "")
    else
        print_error "Cloud SQL exists in $CURRENT_REGION, not $REGION"
        print_warning "Please delete and recreate, or use existing instance"
        exit 1
    fi
else
    echo "  Creating PostgreSQL in $REGION (db-f1-micro = FREE TIER eligible, ~5-10 min)..."
    gcloud sql instances create "$DB_INSTANCE" \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region="$REGION" \
        --root-password="$DB_ROOT_PASSWORD" \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --project="$PROJECT_ID" || {
        print_error "Failed to create Cloud SQL"
        exit 1
    }
    print_status "Cloud SQL created in $REGION (FREE TIER: db-f1-micro)"
    
    # Create database and user
    gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE" --project="$PROJECT_ID" 2>/dev/null || true
    gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_APP_PASSWORD" --project="$PROJECT_ID" 2>/dev/null || true
    
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
    
    echo ""
    print_warning "⚠️  SAVE THESE PASSWORDS:"
    echo "  Root: $DB_ROOT_PASSWORD"
    echo "  App: $DB_APP_PASSWORD"
    echo "  Connection: $CONNECTION_NAME"
    echo ""
fi

DATABASE_URL="postgresql://$DB_USER:$DB_APP_PASSWORD@localhost/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"

# Create Redis - COST OPTIMIZED (1GB = MINIMUM SIZE)
echo ""
echo "🔴 Creating Redis in $REGION - MINIMUM SIZE (1GB basic tier)..."
if gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Redis instance already exists in $REGION"
else
    echo "  Creating Redis 1GB basic tier in $REGION (~10-15 min)..."
    gcloud redis instances create "$REDIS_INSTANCE" \
        --size=1 \
        --region="$REGION" \
        --redis-version=redis_7_0 \
        --tier=basic \
        --network=default \
        --project="$PROJECT_ID" || {
        print_error "Failed to create Redis"
        exit 1
    }
    print_status "Redis created in $REGION (1GB - MINIMUM SIZE)"
fi

REDIS_HOST=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(host)" --project="$PROJECT_ID" 2>/dev/null || echo "")
REDIS_PORT=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(port)" --project="$PROJECT_ID" 2>/dev/null || echo "6379")
if [ -n "$REDIS_HOST" ] && [ "$REDIS_HOST" != "" ]; then
    REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT"
    print_status "Redis URL: $REDIS_URL"
else
    print_warning "Redis host not available yet (may still be provisioning)"
    REDIS_URL=""
fi

# Create Storage - COST OPTIMIZED (Standard storage)
echo ""
echo "📦 Creating Storage Bucket in $REGION..."
if gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
    CURRENT_LOCATION=$(gsutil ls -L -b "gs://$BUCKET_NAME" 2>/dev/null | grep "Location constraint" | awk '{print $3}' || echo "")
    if [ "$CURRENT_LOCATION" = "$REGION" ]; then
        print_status "Storage bucket already exists in $REGION"
    else
        print_warning "Bucket exists in $CURRENT_LOCATION, creating new one or moving..."
        # Note: Can't move buckets, would need to recreate
    fi
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$BUCKET_NAME" || {
        print_error "Failed to create storage bucket"
        exit 1
    }
    print_status "Storage bucket created in $REGION (Standard tier)"
fi

# Update secrets
echo ""
echo "🔐 Updating Secret Manager..."
echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets create database-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || true

if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" != "redis://:6379" ]; then
    echo -n "$REDIS_URL" | gcloud secrets versions add redis-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || \
        echo -n "$REDIS_URL" | gcloud secrets create redis-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || true
fi

print_status "Secrets updated"

# Summary
echo ""
echo "💰 COST BREAKDOWN (Monthly Estimates) - INDIA REGION:"
echo "  Cloud SQL (db-f1-micro):     \$0-7    (FREE TIER eligible)"
echo "  Redis (1GB basic):            ~\$35.77 (MINIMUM SIZE)"
echo "  Storage (10GB):               ~\$0.20  (Standard tier)"
echo "  Cloud Run (when deployed):    \$0-10   (FREE TIER: 2M requests)"
echo "  ─────────────────────────────────────────────"
echo "  ESTIMATED TOTAL:              ~\$36-53/month"
echo "  (With free tier usage:        ~\$36-43/month)"
echo ""
echo "🇮🇳 Region: $REGION (Mumbai, India)"
echo "   Optimized for India users - lowest latency"
echo ""
print_status "✅ Infrastructure ready in $REGION (Mumbai, India)"
print_status "✅ Ready to deploy API and worker to $REGION"
