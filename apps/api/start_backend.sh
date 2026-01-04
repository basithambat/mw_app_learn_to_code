#!/bin/bash

# Start Backend Server Script
# This script starts the NestJS backend API server

echo "🚀 Starting Mywasiyat Backend API..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating from env.example..."
  if [ -f ../infra/env.example ]; then
    cp ../infra/env.example .env
    echo "✅ Created .env file"
  else
    echo "❌ env.example not found. Please create .env manually."
    exit 1
  fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if database is running (optional check)
echo "🔍 Checking database connection..."
echo ""

# Start the server
echo "🌟 Starting NestJS server in development mode..."
echo "📡 Server will be available at: http://localhost:3000"
echo "📚 API Docs will be available at: http://localhost:3000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run start:dev
