#!/bin/bash

echo "🚀 Starting Expo development server..."
echo "📱 Project: WhatSay App"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Installing dependencies..."
    npm install
fi

# Start Expo
echo "✅ Starting Expo server..."
npm start
