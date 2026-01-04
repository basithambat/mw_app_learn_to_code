#!/bin/bash

# Find Project ID from Project Number and Run Setup

set -e

PROJECT_NUMBER="278662370606"

echo "🔍 Finding Project ID for project number: $PROJECT_NUMBER"
echo ""

# Try to find project ID
PROJECT_ID=$(gcloud projects list --filter="projectNumber:$PROJECT_NUMBER" --format="value(projectId)" 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not find Project ID automatically."
    echo ""
    echo "Please provide your Project ID manually."
    echo "You can find it by running:"
    echo "  gcloud projects list"
    echo ""
    echo "Or check in GCP Console: https://console.cloud.google.com"
    echo ""
    read -p "Enter your Project ID: " PROJECT_ID
    
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Project ID is required. Exiting."
        exit 1
    fi
fi

echo "✅ Found Project ID: $PROJECT_ID"
echo ""

# Verify it matches the project number
VERIFY_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null || echo "")
if [ "$VERIFY_NUMBER" != "$PROJECT_NUMBER" ]; then
    echo "⚠️  Warning: Project ID doesn't match project number $PROJECT_NUMBER"
    echo "   Project Number found: $VERIFY_NUMBER"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run the setup script
echo "🚀 Running infrastructure setup..."
echo ""
./setup-gcp-with-project.sh "$PROJECT_ID"
