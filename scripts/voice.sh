#!/bin/bash
echo "🎤 Record voice (or type manually):"
read -p "Voice text: " T
curl -s -X POST http://127.0.0.1:10000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"$T\"}" | grep -o '"response":"[^"]*"' | cut -d'"' -f4 | sed 's/\\n/\n/g'
