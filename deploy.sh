#!/bin/bash

APP_DIR="/root/inbox-zero"

echo "Starting deployment via PAT at $(date)"
cd $APP_DIR

# Fetch and pull the latest changes (works now with PAT auth)
echo "Fetching and Pulling latest changes..."
git pull origin main

# Restart the application using systemd
echo "Restarting application service..."
sudo systemctl restart inbox-zero

echo "Deployment finished."
