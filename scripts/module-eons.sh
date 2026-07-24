#!/bin/bash
cd ~/universal_env/apps/myai
mkdir -p "$HOME/SwiftBackup/ciwu"
cat > scripts/auto-backup.sh << 'B'
#!/bin/bash
TS=$(date +%Y%m%d_%H%M%S)
tar -czf "$HOME/SwiftBackup/ciwu/ciwu_$TS.tar.gz" -C "$HOME/universal_env/apps/myai" data/ config/
echo "✅ Backup: ciwu_$TS.tar.gz"
B
chmod +x scripts/auto-backup.sh
(crontab -l 2>/dev/null | grep -v "auto-backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/universal_env/apps/myai/scripts/auto-backup.sh") | crontab -
echo "✅ Daily backups set (2 AM). Manual: ./scripts/auto-backup.sh"
