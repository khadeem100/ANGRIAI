#!/bin/bash

APP_DIR="/root/inbox-zero"

echo "Starting robust deployment at $(date)"
cd $APP_DIR

# ----------------------------------------------------
# NEW ROBUST PULL SEQUENCE
# 1. Fetch latest changes from remote
git fetch origin main

# 2. Force local branch to exactly match remote branch (safest for CD server)
echo "Resetting local branch to match origin/main..."
git reset --hard origin/main

# 3. Clean up any ignored or untracked files (optional, but good practice)
git clean -f -d
# ----------------------------------------------------

# Restart the application using systemd
echo "Restarting application service..."
sudo systemctl restart inbox-zero

echo "Deployment finished."
