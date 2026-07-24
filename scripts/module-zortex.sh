#!/bin/bash
cd ~/universal_env/apps/myai
cat > scripts/sync-tablet.sh << 'S'
#!/bin/bash
T="/sdcard/universal_env"
S="$HOME/universal_env/apps/myai"
if [ ! -d "$T" ]; then echo "❌ Tablet not mounted"; exit 1; fi
mkdir -p "$T/apps/myai/data/memory"
cp -v "$S/data/memory/cortex.db" "$T/apps/myai/data/memory/"
cp -v "$S/data/memory/eons.db" "$T/apps/myai/data/memory/"
echo "✅ Synced to tablet!"
S
chmod +x scripts/sync-tablet.sh
echo "✅ Tablet sync ready: ./scripts/sync-tablet.sh"
