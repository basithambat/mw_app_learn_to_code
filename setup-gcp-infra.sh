#!/bin/bash

# GCP Infrastructure Setup Script for WhatSay App
# Run this after: gcloud auth login

set -e  # Exit on error

echo "🚀 Starting GCP Infrastructure Setup for WhatSay App..."
echo ""

# Configuration
PROJECT_ID="whatsay-app"
PROJECT_NAME="WhatSay App"
REGION="us-central1"
DB_INSTANCE="whatsay-db"
DB_NAME="ingestion_db"
DB_USER="app_user"
REDIS_INSTANCE="whatsay-redis"
BUCKET_NAME="whatsay-content"
VPC_CONNECTOR="whatsay-connector"
SERVICE_NAME="whatsay-api"
WORKER_JOB="whatsay-worker"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
echo "Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "Not authenticated. Please run: gcloud auth login"
    exit 1
fi
print_status "Authenticated"

# Step 1: Create or select project
echo ""
echo "📦 Step 1: Setting up GCP Project..."
if gcloud projects describe "$PROJECT_ID" &>/dev/null; then
    print_status "Project $PROJECT_ID already exists"
else
    echo "Creating project $PROJECT_ID..."
    gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME" || {
        print_warning "Project creation failed. It may already exist or you may need to enable billing."
        read -p "Do you want to continue with existing project? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    print_status "Project created"
fi

gcloud config set project "$PROJECT_ID"
print_status "Project set to $PROJECT_ID"

# Step 2: Enable required APIs
echo ""
echo "🔌 Step 2: Enabling required APIs..."
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
    echo "Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT_ID" || print_warning "Failed to enable $api (may already be enabled)"
done
print_status "APIs enabled"

# Step 3: Create Cloud SQL instance
echo ""
echo "🗄️  Step 3: Creating Cloud SQL (PostgreSQL) instance..."
if gcloud sql instances describe "$DB_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Cloud SQL instance $DB_INSTANCE already exists"
else
    echo "Creating PostgreSQL instance (this may take 5-10 minutes)..."
    read -sp "Enter a secure password for database root user: " DB_ROOT_PASSWORD
    echo
    read -sp "Enter a secure password for app user ($DB_USER): " DB_APP_PASSWORD
    echo
    
    gcloud sql instances create "$DB_INSTANCE" \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region="$REGION" \
        --root-password="$DB_ROOT_PASSWORD" \
        --storage-type=SSD \
        --storage-size=20GB \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --enable-bin-log \
        --project="$PROJECT_ID" || {
        print_error "Failed to create Cloud SQL instance"
        exit 1
    }
    print_status "Cloud SQL instance created"
    
    # Create database
    echo "Creating database $DB_NAME..."
    gcloud sql databases create "$DB_NAME" \
        --instance="$DB_INSTANCE" \
        --project="$PROJECT_ID" || print_warning "Database may already exist"
    print_status "Database created"
    
    # Create user
    echo "Creating database user $DB_USER..."
    gcloud sql users create "$DB_USER" \
        --instance="$DB_INSTANCE" \
        --password="$DB_APP_PASSWORD" \
        --project="$PROJECT_ID" || print_warning "User may already exist"
    print_status "Database user created"
    
    # Get connection name
    CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(connectionName)" --project="$PROJECT_ID")
    print_status "Connection name: $CONNECTION_NAME"
    
    # Create connection string
    DATABASE_URL="postgresql://$DB_USER:$DB_APP_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"
    echo ""
    print_status "Database URL created (saving to Secret Manager in next step)"
fi

# Step 4: Create Memorystore Redis instance
echo ""
echo "🔴 Step 4: Creating Memorystore (Redis) instance..."
if gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Redis instance $REDIS_INSTANCE already exists"
else
    echo "Creating Redis instance (this may take 10-15 minutes)..."
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

# Get Redis host
REDIS_HOST=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(host)" --project="$PROJECT_ID")
REDIS_PORT=$(gcloud redis instances describe "$REDIS_INSTANCE" --region="$REGION" --format="value(port)" --project="$PROJECT_ID")
REDIS_URL="redis://$REDIS_HOST:$REDIS_PORT"
print_status "Redis URL: $REDIS_URL"

# Step 5: Create Cloud Storage bucket
echo ""
echo "📦 Step 5: Creating Cloud Storage bucket..."
if gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
    print_status "Bucket $BUCKET_NAME already exists"
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$BUCKET_NAME" || {
        print_error "Failed to create storage bucket"
        exit 1
    }
    print_status "Storage bucket created"
    
    # Make bucket public for media (optional - you can change this)
    echo "Setting bucket permissions..."
    gsutil iam ch allUsers:objectViewer "gs://$BUCKET_NAME" || print_warning "Failed to set public access (you can do this manually)"
    print_status "Bucket permissions configured"
fi

# Create service account for storage
echo "Creating service account for storage access..."
SA_EMAIL="whatsay-storage@$PROJECT_ID.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
    print_status "Service account already exists"
else
    gcloud iam service-accounts create whatsay-storage \
        --display-name="WhatSay Storage Service Account" \
        --project="$PROJECT_ID" || print_warning "Service account may already exist"
    print_status "Service account created"
    
    # Grant storage access
    gsutil iam ch "serviceAccount:$SA_EMAIL:objectAdmin" "gs://$BUCKET_NAME"
    print_status "Storage permissions granted"
fi

# Step 6: Create VPC Connector
echo ""
echo "🔗 Step 6: Creating VPC Connector..."
if gcloud compute networks vpc-access connectors describe "$VPC_CONNECTOR" --region="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    print_status "VPC Connector already exists"
else
    echo "Creating VPC connector (this may take 5-10 minutes)..."
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

# Step 7: Set up Secret Manager
echo ""
echo "🔐 Step 7: Setting up Secret Manager..."
if [ -n "$DATABASE_URL" ]; then
    echo "Creating database-url secret..."
    echo -n "$DATABASE_URL" | gcloud secrets create database-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add database-url \
        --data-file=- \
        --project="$PROJECT_ID"
    print_status "database-url secret created/updated"
fi

if [ -n "$REDIS_URL" ]; then
    echo "Creating redis-url secret..."
    echo -n "$REDIS_URL" | gcloud secrets create redis-url \
        --data-file=- \
        --project="$PROJECT_ID" 2>/dev/null || \
    echo -n "$REDIS_URL" | gcloud secrets versions add redis-url \
        --data-file=- \
        --project="$PROJECT_ID"
    print_status "redis-url secret created/updated"
fi

# Create placeholder secrets (user needs to update these)
echo "Creating placeholder secrets (update these with real values)..."
echo -n "PLACEHOLDER_UPDATE_ME" | gcloud secrets create firebase-service-account \
    --data-file=- \
    --project="$PROJECT_ID" 2>/dev/null || print_warning "firebase-service-account secret already exists"

echo -n "PLACEHOLDER_UPDATE_ME" | gcloud secrets create google-api-key \
    --data-file=- \
    --project="$PROJECT_ID" 2>/dev/null || print_warning "google-api-key secret already exists"

echo -n "PLACEHOLDER_UPDATE_ME" | gcloud secrets create s3-access-key \
    --data-file=- \
    --project="$PROJECT_ID" 2>/dev/null || print_warning "s3-access-key secret already exists"

echo -n "PLACEHOLDER_UPDATE_ME" | gcloud secrets create s3-secret-key \
    --data-file=- \
    --project="$PROJECT_ID" 2>/dev/null || print_warning "s3-secret-key secret already exists"

print_status "Secrets created (update placeholders with real values)"

# Grant Cloud Run service account access to secrets
echo "Granting Cloud Run access to secrets..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
CLOUD_RUN_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

for secret in database-url redis-url firebase-service-account google-api-key s3-access-key s3-secret-key; do
    gcloud secrets add-iam-policy-binding "$secret" \
        --member="serviceAccount:$CLOUD_RUN_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --project="$PROJECT_ID" 2>/dev/null || print_warning "Failed to grant access to $secret"
done
print_status "Secret access granted"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GCP Infrastructure Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Created Resources:"
echo "  ✓ Project: $PROJECT_ID"
echo "  ✓ Cloud SQL: $DB_INSTANCE"
echo "  ✓ Redis: $REDIS_INSTANCE"
echo "  ✓ Storage Bucket: $BUCKET_NAME"
echo "  ✓ VPC Connector: $VPC_CONNECTOR"
echo "  ✓ Secrets: database-url, redis-url, and placeholders"
echo ""
echo "📝 Next Steps:"
echo "  1. Update placeholder secrets with real values:"
echo "     gcloud secrets versions add firebase-service-account --data-file=-"
echo "     gcloud secrets versions add google-api-key --data-file=-"
echo "     gcloud secrets versions add s3-access-key --data-file=-"
echo "     gcloud secrets versions add s3-secret-key --data-file=-"
echo ""
echo "  2. Deploy your API to Cloud Run:"
echo "     cd ingestion-platform"
echo "     gcloud run deploy $SERVICE_NAME --source . --region $REGION \\"
echo "       --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE \\"
echo "       --vpc-connector $VPC_CONNECTOR \\"
echo "       --set-secrets DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest"
echo ""
echo "  3. Run database migrations:"
echo "     gcloud run jobs create migrate-db --image gcr.io/$PROJECT_ID/$SERVICE_NAME \\"
echo "       --region $REGION --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE \\"
echo "       --set-secrets DATABASE_URL=database-url:latest \\"
echo "       --command npx --args prisma,migrate,deploy"
echo ""
echo "🔗 Useful Commands:"
echo "  Get Cloud SQL connection: gcloud sql instances describe $DB_INSTANCE --format='value(connectionName)'"
echo "  Get Redis host: gcloud redis instances describe $REDIS_INSTANCE --region=$REGION --format='value(host)'"
echo "  List secrets: gcloud secrets list"
echo ""
echo "💰 Estimated Monthly Cost: ~\$40-60 (with free tier: ~\$0-10)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
