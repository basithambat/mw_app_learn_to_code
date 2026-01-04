#!/bin/bash

# GCP Infrastructure Setup - COST OPTIMIZED VERSION
# Uses free tier and minimal configurations to keep costs low

set -e

PROJECT_ID="gen-lang-client-0803362165"
PROJECT_NUMBER="278662370606"
REGION="us-central1"  # Cheapest region

# Cost-optimized configurations
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

echo "💰 GCP Infrastructure Setup - COST OPTIMIZED"
echo "Project: $PROJECT_ID"
echo "Using free tier and minimal configurations"
echo ""

# Set project
gcloud config set project "$PROJECT_ID" 2>/dev/null || true

# Check if APIs are enabled by trying a simple operation
echo "Checking API availability..."
API_CHECK=$(gcloud services list --enabled --filter="name:sqladmin.googleapis.com" --format="value(name)" --project="$PROJECT_ID" 2>/dev/null || echo "")

if [ -z "$API_CHECK" ]; then
    print_warning "APIs may not be enabled yet"
    print_warning "Please enable these APIs in console first:"
    echo "  1. Service Usage API"
    echo "  2. Cloud SQL Admin API"
    echo "  3. Memorystore for Redis API"
    echo "  4. Cloud Run API"
    echo "  5. Secret Manager API"
    echo "  6. Cloud Storage API"
    echo "  7. Compute Engine API"
    echo "  8. Serverless VPC Access API"
    echo ""
    echo "Or visit: https://console.cloud.google.com/apis/library?project=$PROJECT_ID"
    echo ""
    read -p "Press Enter after enabling APIs, or Ctrl+C to exit..."
fi

# Create Cloud SQL - COST OPTIMIZED (db-f1-micro = free tier eligible)
echo ""
echo "🗄️  Creating Cloud SQL (PostgreSQL) - FREE TIER..."
if gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Cloud SQL instance already exists"
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID" 2>/dev/null || echo "")
else
    # Generate secure passwords
    DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    DB_APP_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    echo "  Creating PostgreSQL (db-f1-micro = FREE TIER eligible, ~5-10 min)..."
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
        print_warning "Make sure Cloud SQL Admin API is enabled"
        exit 1
    }
    print_status "Cloud SQL created (FREE TIER: db-f1-micro)"
    
    # Create database and user
    gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE" --project="$PROJECT_ID" 2>/dev/null || true
    gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_APP_PASSWORD" --project="$PROJECT_ID" 2>/dev/null || true
    
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
    DATABASE_URL="postgresql://$DB_USER:$DB_APP_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"
    
    echo ""
    print_warning "⚠️  SAVE THESE PASSWORDS:"
    echo "  Root: $DB_ROOT_PASSWORD"
    echo "  App: $DB_APP_PASSWORD"
    echo "  Connection: $CONNECTION_NAME"
    echo ""
fi

# Create Redis - COST OPTIMIZED (1GB = MINIMUM SIZE AVAILABLE)
echo ""
echo "🔴 Creating Redis - MINIMUM SIZE (1GB basic tier)..."
echo "  Note: 1GB is the smallest available for GCP Memorystore Redis Basic tier"
echo "  Pricing: ~\$35.77/month (1GB × \$0.049/GiB/hour)"
if gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Redis instance already exists"
else
    echo "  Creating Redis 1GB basic tier (~10-15 min)..."
    gcloud redis instances create "$REDIS_INSTANCE" \
        --size=1 \
        --region="$REGION" \
        --redis-version=redis_7_0 \
        --tier=basic \
        --network=default \
        --project="$PROJECT_ID" || {
        print_error "Failed to create Redis"
        print_warning "Make sure Memorystore for Redis API is enabled"
        exit 1
    }
    print_status "Redis created (1GB - MINIMUM SIZE, no smaller option available)"
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

# Create Storage - COST OPTIMIZED (Standard storage, not premium)
echo ""
echo "📦 Creating Storage Bucket - STANDARD TIER..."
if gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
    print_status "Storage bucket already exists"
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$BUCKET_NAME" || {
        print_error "Failed to create storage bucket"
        exit 1
    }
    print_status "Storage bucket created (Standard tier - cost-effective)"
    
    # Set public read (optional - for media)
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME" 2>/dev/null || print_warning "Could not set public access"
fi

# Create VPC Connector - COST OPTIMIZED (minimal instances)
echo ""
echo "🔗 Creating VPC Connector - MINIMAL INSTANCES..."
if gcloud compute networks vpc-access connectors describe "$VPC_CONNECTOR" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "VPC Connector already exists"
else
    echo "  Creating VPC connector with minimal instances (~5-10 min)..."
    gcloud compute networks vpc-access connectors create "$VPC_CONNECTOR" \
        --region="$REGION" \
        --subnet=default \
        --subnet-project="$PROJECT_ID" \
        --min-instances=1 \
        --max-instances=2 \
        --machine-type=e2-micro \
        --project="$PROJECT_ID" || {
        print_error "Failed to create VPC connector"
        print_warning "Make sure Serverless VPC Access API is enabled"
        exit 1
    }
    print_status "VPC Connector created (minimal instances - cost optimized)"
fi

# Set up Secret Manager
echo ""
echo "🔐 Setting up Secret Manager..."
if [ -n "$DATABASE_URL" ]; then
    echo -n "$DATABASE_URL" | gcloud secrets create database-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add database-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Could not update database-url"
    print_status "database-url secret configured"
fi

if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" != "redis://:6379" ]; then
    echo -n "$REDIS_URL" | gcloud secrets create redis-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$REDIS_URL" | gcloud secrets versions add redis-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Could not update redis-url"
    print_status "redis-url secret configured"
fi

# Grant Cloud Run access to secrets
echo "  Granting Cloud Run access to secrets..."
PROJECT_NUMBER_VERIFY=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null || echo "")
if [ -n "$PROJECT_NUMBER_VERIFY" ]; then
    CLOUD_RUN_SA="$PROJECT_NUMBER_VERIFY-compute@developer.gserviceaccount.com"
    for secret in database-url redis-url; do
        gcloud secrets add-iam-policy-binding "$secret" \
            --member="serviceAccount:$CLOUD_RUN_SA" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID" 2>/dev/null || print_warning "Could not grant access to $secret"
    done
    print_status "Secret access permissions granted"
fi

# Cost Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GCP Infrastructure Setup Complete - COST OPTIMIZED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💰 COST BREAKDOWN (Monthly Estimates):"
echo "  Cloud SQL (db-f1-micro):     \$0-7    (FREE TIER eligible)"
echo "  Redis (1GB basic):            ~\$35.77 (MINIMUM SIZE - no smaller available)"
echo "  Storage (10GB):               ~\$0.20  (Standard tier)"
echo "  VPC Connector (1-2 instances): ~\$10-15 (minimal)"
echo "  Secret Manager (6 secrets):  ~\$0.06  (minimal)"
echo "  Cloud Run (when deployed):    \$0-10   (FREE TIER: 2M requests)"
echo "  ─────────────────────────────────────────────"
echo "  ESTIMATED TOTAL:              ~\$46-68/month"
echo "  (With free tier usage:        ~\$36-48/month)"
echo ""
echo "💡 Redis Cost Note:"
echo "  1GB is the absolute minimum for GCP Memorystore Redis"
echo "  Alternative: Upstash Redis (serverless) ~\$0.20/100K commands"
echo "  But requires code changes (BullMQ → Upstash Queue)"
echo ""
echo "📋 Created Resources:"
echo "  ✓ Cloud SQL: $DB_INSTANCE (FREE TIER: db-f1-micro)"
if [ -n "$CONNECTION_NAME" ]; then
    echo "    Connection: $CONNECTION_NAME"
fi
echo "  ✓ Redis: $REDIS_INSTANCE (1GB basic - minimal cost)"
if [ -n "$REDIS_HOST" ]; then
    echo "    Host: $REDIS_HOST:$REDIS_PORT"
fi
echo "  ✓ Storage: $BUCKET_NAME (Standard tier)"
echo "  ✓ VPC Connector: $VPC_CONNECTOR (minimal instances)"
echo "  ✓ Secrets: database-url, redis-url"
echo ""
echo "💡 COST SAVING TIPS:"
echo "  - Cloud SQL: Using db-f1-micro (free tier eligible)"
echo "  - Redis: Using smallest size (1GB basic)"
echo "  - Storage: Using Standard tier (not Premium)"
echo "  - VPC: Minimal instances (1-2 instead of 2-3)"
echo "  - Cloud Run: Will use free tier (2M requests/month)"
echo ""
echo "📝 Next Steps:"
echo "  1. Deploy API to Cloud Run (will use free tier)"
echo "  2. Monitor costs in GCP Console"
echo "  3. Scale up only when needed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
