#!/bin/bash

echo "📱 Expo Server Logs"
echo "=================="
echo ""

if [ -f "expo-server-output.log" ]; then
    tail -f expo-server-output.log
else
    echo "❌ Log file not found. Server may not be running."
    echo "💡 Try running: npm start"
fi
