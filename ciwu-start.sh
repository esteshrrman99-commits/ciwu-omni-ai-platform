#!/bin/bash
cd ~/universal_env/apps/myai

echo "═══════════════════════════════════════"
echo "       🧠 CIWU ENHANCED AI v2.0        ║"
echo "═══════════════════════════════════════"
echo ""
echo "Launch mode:"
echo "  1. CLI Chat (Interactive)"
echo "  2. REST API Server"
echo "  3. Both (API background + CLI)"
echo ""

read -p "Choose [1-3]: " mode

case $mode in
    1)
        node src/enhanced-chat.js
        ;;
    2)
        node src/enhanced-api.js
        ;;
    3)
        node src/enhanced-api.js &
        sleep 2
        echo "✓ API running at http://127.0.0.1:3000"
        node src/enhanced-chat.js
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
