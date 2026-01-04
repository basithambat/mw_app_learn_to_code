#!/bin/bash

# Run This Script to Set Up GCP Infrastructure
# Project ID: gen-lang-client-0803362165
# Project Number: 278662370606

echo "🚀 GCP Infrastructure Setup"
echo "Project: gen-lang-client-0803362165"
echo ""

# Step 1: Authenticate (if not already)
echo "Step 1: Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  Please authenticate first:"
    echo "   gcloud auth login"
    echo ""
    read -p "Press Enter after you've authenticated, or Ctrl+C to exit..."
fi

# Step 2: Set project
echo ""
echo "Step 2: Setting project..."
gcloud config set project gen-lang-client-0803362165

# Step 3: Run the setup
echo ""
echo "Step 3: Running infrastructure setup..."
echo "This will take 20-30 minutes..."
echo ""

./setup-gcp-with-project.sh gen-lang-client-0803362165

echo ""
echo "✅ Setup complete! Check the output above for next steps."
