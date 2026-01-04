#!/bin/bash

# GCP Infrastructure Setup - Using Project Number 278662370606
# This script will work once you provide the PROJECT_ID

set -e

PROJECT_NUMBER="278662370606"
REGION="us-central1"
DB_INSTANCE="whatsay-db"
DB_NAME="ingestion_db"
DB_USER="app_user"
REDIS_INSTANCE="whatsay-redis"
BUCKET_NAME="whatsay-content"
VPC_CONNECTOR="whatsay-connector"

# Get PROJECT_ID from argument or try to find it
if [ -n "$1" ]; then
    PROJECT_ID="$1"
else
    echo "⚠️  Please provide PROJECT_ID as argument"
    echo "Usage: ./setup-gcp-with-project.sh [PROJECT_ID]"
    echo ""
    echo "To find your PROJECT_ID:"
    echo "  gcloud projects list --filter='projectNumber:$PROJECT_NUMBER'"
    exit 1
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

echo "🚀 GCP Infrastructure Setup"
echo "Project Number: $PROJECT_NUMBER"
echo "Project ID: $PROJECT_ID"
echo ""

# Verify project
echo "Verifying project..."
PROJECT_VERIFY=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null || echo "")
if [ "$PROJECT_VERIFY" != "$PROJECT_NUMBER" ]; then
    print_error "Project ID doesn't match project number. Please verify."
    exit 1
fi
print_status "Project verified"

# Set project
gcloud config set project "$PROJECT_ID"
print_status "Project set to $PROJECT_ID"

# Enable APIs
echo ""
echo "🔌 Enabling required APIs..."
APIS=(
    "sqladmin.googleapis.com"
    "redis.googleapis.com"
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "secretmanager.googleapis.com"
    "storage-component.googleapis.com"
    "compute.googleapis.com"
    "vpcaccess.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo "  Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT_ID" 2>/dev/null || print_warning "  $api may already be enabled"
done
print_status "All APIs enabled"

# Create Cloud SQL
echo ""
echo "🗄️  Creating Cloud SQL (PostgreSQL) instance..."
if gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Cloud SQL instance already exists"
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
else
    # Generate secure passwords
    DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    DB_APP_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    echo "  Creating PostgreSQL instance (this takes 5-10 minutes)..."
    gcloud sql instances create "$DB_INSTANCE" \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region="$REGION" \
        --root-password="$DB_ROOT_PASSWORD" \
        --storage-type=SSD \
        --storage-size=20GB \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --project="$PROJECT_ID" || {
        print_error "Failed to create Cloud SQL instance"
        exit 1
    }
    print_status "Cloud SQL instance created"
    
    echo "  Creating database..."
    gcloud sql databases create "$DB_NAME" \
        --instance="$DB_INSTANCE" \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Database may already exist"
    
    echo "  Creating database user..."
    gcloud sql users create "$DB_USER" \
        --instance="$DB_INSTANCE" \
        --password="$DB_APP_PASSWORD" \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "User may already exist"
    
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
    DATABASE_URL="postgresql://$DB_USER:$DB_APP_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"
    
    echo ""
    print_warning "⚠️  IMPORTANT - SAVE THESE PASSWORDS:"
    echo "  Root Password: $DB_ROOT_PASSWORD"
    echo "  App User Password: $DB_APP_PASSWORD"
    echo "  Connection Name: $CONNECTION_NAME"
    echo ""
fi

# Create Redis
echo ""
echo "🔴 Creating Memorystore (Redis) instance..."
if gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Redis instance already exists"
else
    echo "  Creating Redis instance (this takes 10-15 minutes)..."
    gcloud redis instances create "$REDIS_INSTANCE" \
        --size=1 \
        --region="$REGION" \
        --redis-version=redis_7_0 \
        --tier=basic \
        --network=default \
        --project="$PROJECT_ID" || {
        print_error "Failed to create Redis instance"
        exit 1
    }
    print_status "Redis instance created"
fi

# Get Redis connection details
REDIS_HOST=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(host)" --project="$PROJECT_ID" 2>/dev/null || echo "")
REDIS_PORT=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(port)" --project="$PROJECT_ID" 2>/dev/null || echo "6379")
if [ -n "$REDIS_HOST" ] && [ "$REDIS_HOST" != "" ]; then
    REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT"
    print_status "Redis URL: $REDIS_URL"
else
    print_warning "Redis host not available yet (may still be provisioning)"
    REDIS_URL=""
fi

# Create Storage Bucket
echo ""
echo "📦 Creating Cloud Storage bucket..."
if gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
    print_status "Storage bucket already exists"
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$BUCKET_NAME" || {
        print_error "Failed to create storage bucket"
        exit 1
    }
    print_status "Storage bucket created"
    
    # Set public read access (optional - you can change this)
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME" 2>/dev/null || print_warning "Could not set public access"
fi

# Create Service Account for Storage
echo "  Creating storage service account..."
SA_EMAIL="whatsay-storage@$PROJECT_ID.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Service account already exists"
else
    gcloud iam service-accounts create whatsay-storage \
        --display-name="WhatSay Storage Service Account" \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Service account may already exist"
    
    gsutil iam ch "serviceAccount:$SA_EMAIL:objectAdmin" "gs://$BUCKET_NAME" 2>/dev/null || true
    print_status "Service account created and permissions granted"
fi

# Create VPC Connector
echo ""
echo "🔗 Creating VPC Connector..."
if gcloud compute networks vpc-access connectors describe "$VPC_CONNECTOR" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "VPC Connector already exists"
else
    echo "  Creating VPC connector (this takes 5-10 minutes)..."
    gcloud compute networks vpc-access connectors create "$VPC_CONNECTOR" \
        --region="$REGION" \
        --subnet=default \
        --subnet-project="$PROJECT_ID" \
        --min-instances=2 \
        --max-instances=3 \
        --machine-type=e2-micro \
        --project="$PROJECT_ID" || {
        print_error "Failed to create VPC connector"
        exit 1
    }
    print_status "VPC Connector created"
fi

# Set up Secret Manager
echo ""
echo "🔐 Setting up Secret Manager..."
if [ -n "$DATABASE_URL" ]; then
    echo "  Creating database-url secret..."
    echo -n "$DATABASE_URL" | gcloud secrets create database-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add database-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Could not update database-url secret"
    print_status "database-url secret configured"
fi

if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" != "redis://:6379" ]; then
    echo "  Creating redis-url secret..."
    echo -n "$REDIS_URL" | gcloud secrets create redis-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$REDIS_URL" | gcloud secrets versions add redis-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Could not update redis-url secret"
    print_status "redis-url secret configured"
fi

# Grant Cloud Run service account access to secrets
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

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GCP Infrastructure Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Created Resources:"
echo "  ✓ Project: $PROJECT_ID (Number: $PROJECT_NUMBER)"
echo "  ✓ Cloud SQL: $DB_INSTANCE"
if [ -n "$CONNECTION_NAME" ]; then
    echo "    Connection: $CONNECTION_NAME"
fi
echo "  ✓ Redis: $REDIS_INSTANCE"
if [ -n "$REDIS_HOST" ]; then
    echo "    Host: $REDIS_HOST:$REDIS_PORT"
fi
echo "  ✓ Storage Bucket: $BUCKET_NAME"
echo "  ✓ VPC Connector: $VPC_CONNECTOR"
echo "  ✓ Secrets: database-url, redis-url"
echo ""
echo "📝 Next Steps:"
echo "  1. Update other secrets (Firebase, API keys):"
echo "     gcloud secrets versions add firebase-service-account --data-file=-"
echo ""
echo "  2. Deploy API to Cloud Run:"
echo "     cd ingestion-platform"
echo "     gcloud run deploy whatsay-api --source . --region $REGION \\"
echo "       --add-cloudsql-instances $CONNECTION_NAME \\"
echo "       --vpc-connector $VPC_CONNECTOR \\"
echo "       --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
