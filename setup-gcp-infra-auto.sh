#!/bin/bash

# GCP Infrastructure Setup Script - Auto Version
# This version uses existing project or allows you to specify one
# Run: gcloud auth login first, then: ./setup-gcp-infra-auto.sh [PROJECT_ID]

set -e

# Get project ID from argument or use existing
if [ -n "$1" ]; then
    PROJECT_ID="$1"
else
    # Try to get current project
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "whatsay-app")
fi

PROJECT_NAME="WhatSay App"
REGION="us-central1"
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

echo "🚀 GCP Infrastructure Setup"
echo "Project: $PROJECT_ID"
echo ""

# Set project
gcloud config set project "$PROJECT_ID" 2>/dev/null || {
    print_error "Failed to set project. Please authenticate: gcloud auth login"
    exit 1
}
print_status "Using project: $PROJECT_ID"

# Enable APIs
echo "Enabling APIs..."
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
    gcloud services enable "$api" --project="$PROJECT_ID" 2>/dev/null || true
done
print_status "APIs enabled"

# Create Cloud SQL (with auto-generated passwords)
echo ""
echo "Creating Cloud SQL instance..."
if gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Cloud SQL instance already exists"
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
else
    # Generate random passwords
    DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    DB_APP_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    echo "Creating PostgreSQL instance (5-10 minutes)..."
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
        print_error "Failed to create Cloud SQL"
        exit 1
    }
    print_status "Cloud SQL created"
    
    gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE" --project="$PROJECT_ID" 2>/dev/null || true
    gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_APP_PASSWORD" --project="$PROJECT_ID" 2>/dev/null || true
    
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
    DATABASE_URL="postgresql://$DB_USER:$DB_APP_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"
    
    echo ""
    print_warning "SAVE THESE PASSWORDS:"
    echo "  Root Password: $DB_ROOT_PASSWORD"
    echo "  App Password: $DB_APP_PASSWORD"
    echo ""
fi

# Create Redis
echo "Creating Redis instance..."
if gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Redis instance already exists"
else
    echo "Creating Redis (10-15 minutes)..."
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
    print_status "Redis created"
fi

REDIS_HOST=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(host)" --project="$PROJECT_ID" 2>/dev/null || echo "")
REDIS_PORT=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(port)" --project="$PROJECT_ID" 2>/dev/null || echo "6379")
REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT"

# Create Storage
echo "Creating storage bucket..."
gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$BUCKET_NAME" 2>/dev/null || print_status "Bucket already exists"

# Create VPC Connector
echo "Creating VPC connector..."
if gcloud compute networks vpc-access connectors describe "$VPC_CONNECTOR" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "VPC Connector already exists"
else
    echo "Creating VPC connector (5-10 minutes)..."
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

# Create Secrets
echo "Setting up secrets..."
if [ -n "$DATABASE_URL" ]; then
    echo -n "$DATABASE_URL" | gcloud secrets create database-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || true
fi

if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" != "redis://:6379" ]; then
    echo -n "$REDIS_URL" | gcloud secrets create redis-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$REDIS_URL" | gcloud secrets versions add redis-url --data-file=- --project="$PROJECT_ID" 2>/dev/null || true
fi

# Grant permissions
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null || echo "")
if [ -n "$PROJECT_NUMBER" ]; then
    CLOUD_RUN_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
    for secret in database-url redis-url; do
        gcloud secrets add-iam-policy-binding "$secret" \
            --member="serviceAccount:$CLOUD_RUN_SA" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID" 2>/dev/null || true
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Connection Name: $CONNECTION_NAME"
echo "Redis Host: $REDIS_HOST"
echo ""
echo "Next: Deploy your API to Cloud Run"
