#!/bin/bash
# CIWU OMNI v2.0 Autonomous Security Backup
# Runs every 6 hours for maximum protection

BACKUP_DIR="$HOME/ciwu-backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="$HOME/ciwu-omni-ai-platform"
LOG_FILE="$BACKUP_DIR/backup.log"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..." >> "$LOG_FILE"

# Copy databases
cp "$APP_DIR/data/memory/cortex.db" "$BACKUP_DIR/cortex_${DATE}.db" 2>>"$LOG_FILE"
cp "$APP_DIR/data/memory/eons.db" "$BACKUP_DIR/eons_${DATE}.db" 2>>"$LOG_FILE"

# Compress
tar -czf "$BACKUP_DIR/ciwu_backup_${DATE}.tar.gz" -C "$BACKUP_DIR" \
    "cortex_${DATE}.db" "eons_${DATE}.db" 2>>"$LOG_FILE"

# Cleanup old backups (keep last 90 days)
find "$BACKUP_DIR" -name "ciwu_backup_*.tar.gz" -mtime +90 -delete 2>>"$LOG_FILE"

# Optional: Cloud sync (uncomment if configured)
# rclone copy "$BACKUP_DIR/ciwu_backup_${DATE}.tar.gz" google-drive:/ciwu-backups/

echo "[$(date)] ✅ Backup complete: ciwu_backup_${DATE}.tar.gz" >> "$LOG_FILE"
