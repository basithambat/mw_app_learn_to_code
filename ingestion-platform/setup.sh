#!/bin/bash

echo "🚀 Starting Firecrawl Ingestion Platform Setup..."

# 1. Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

# 2. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

echo "✅ Prerequisites checked."

# 3. Setup Environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  NOTE: We are using default settings. Open .env if you need to change keys."
fi

# 4. Install Dependencies
echo "📦 Installing dependencies (this might take a minute)..."
npm install

# 5. Start Infrastructure (Database, Redis, Minio)
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for DB to be ready
echo "⏳ Waiting for Database to be ready..."
sleep 10

# 6. Run Database Migrations
echo "🗄️  Setting up Database schema..."
npx prisma migrate dev --name init

# 7. Start the App
echo "✨ Setup complete!"
echo "----------------------------------------"
echo "To run the system, open TWO terminals:"
echo "  1. Run API:    npm run dev"
echo "  2. Run Worker: npm run worker"
echo "----------------------------------------"
