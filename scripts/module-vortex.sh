#!/bin/bash
cd ~/universal_env/apps/myai
cat > scripts/voice.sh << 'V'
#!/bin/bash
echo "🎤 Record voice (or type manually):"
read -p "Voice text: " T
curl -s -X POST http://127.0.0.1:10000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"$T\"}" | grep -o '"response":"[^"]*"' | cut -d'"' -f4 | sed 's/\\n/\n/g'
V
chmod +x scripts/voice.sh
echo "✅ Voice script ready: ./scripts/voice.sh"
