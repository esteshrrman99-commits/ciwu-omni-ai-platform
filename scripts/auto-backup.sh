#!/bin/bash
TS=$(date +%Y%m%d_%H%M%S)
tar -czf "$HOME/SwiftBackup/ciwu/ciwu_$TS.tar.gz" -C "$HOME/universal_env/apps/myai" data/ config/
echo "✅ Backup: ciwu_$TS.tar.gz"
