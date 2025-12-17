#!/bin/bash

# Production Deployment Script for Ubuntu Server
# This script builds and deploys the Inbox Zero application

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /root/inbox-zero

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm build

# Restart with PM2
echo "🔄 Restarting application with PM2..."
if pm2 list | grep -q "inbox-zero"; then
    pm2 restart inbox-zero
    echo "✅ Application restarted!"
else
    echo "⚠️  PM2 process not found. Starting new process..."
    cd apps/web
    pm2 start npm --name "inbox-zero" -- start
    pm2 save
    echo "✅ Application started!"
fi

# Show status
echo ""
echo "📊 Application Status:"
pm2 list | grep inbox-zero

echo ""
echo "✨ Deployment complete!"
echo "🌐 Your app is running at: https://angri.nl"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs inbox-zero"
echo "  - Monitor: pm2 monit"
echo "  - Restart: pm2 restart inbox-zero"
