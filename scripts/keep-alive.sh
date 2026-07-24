#!/bin/bash
URL="https://ciwu-omni-ai-platform.onrender.com/api/health"
echo "🔄 Sending heartbeat every 10 minutes..."
while true; do
    curl -s -o /dev/null -w "%{http_code}" "$URL" &
    sleep 600
done
