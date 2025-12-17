# Ubuntu Server Deployment Guide

## Current Status
You're hosting on your own Ubuntu server - **NO VERCEL NEEDED!**

## Quick Start Deployment

### 1. Build the Application
```bash
cd /root/inbox-zero
pnpm build
```

### 2. Start the Production Server

**Option A: Direct Start (for testing)**
```bash
cd /root/inbox-zero/apps/web
pnpm start
```
This runs on http://localhost:3000

**Option B: PM2 (Recommended for production)**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd /root/inbox-zero/apps/web
pm2 start npm --name "inbox-zero" -- start

# View logs
pm2 logs inbox-zero

# Monitor
pm2 monit

# Save configuration
pm2 save

# Auto-start on server reboot
pm2 startup
# Follow the command it gives you
```

### 3. Setup Nginx Reverse Proxy

This allows you to:
- Run on port 80/443 (standard web ports)
- Add SSL certificates
- Handle multiple domains (angri.nl, hr.angri.nl, etc.)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/inbox-zero
```

**Nginx Configuration:**
```nginx
# Main domain
server {
    listen 80;
    server_name angri.nl www.angri.nl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Subdomain support (hr, marketing, cs, etc.)
server {
    listen 80;
    server_name *.angri.nl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable the site:**
```bash
# Enable configuration
sudo ln -s /etc/nginx/sites-available/inbox-zero /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### 4. Add SSL Certificates (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificates for main domain
sudo certbot --nginx -d angri.nl -d www.angri.nl

# Get certificates for subdomains
sudo certbot --nginx -d hr.angri.nl -d cs.angri.nl -d marketing.angri.nl

# Auto-renewal is setup automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 5. Update Environment Variables

Make sure your `.env` file has the correct production URLs:

```bash
cd /root/inbox-zero/apps/web
nano .env
```

Update these lines:
```env
NEXT_PUBLIC_BASE_URL=https://angri.nl
NEXT_PUBLIC_ROOT_DOMAIN=angri.nl
```

Then restart the app:
```bash
pm2 restart inbox-zero
```

## Useful PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs inbox-zero

# View real-time logs
pm2 logs inbox-zero --lines 100

# Restart app
pm2 restart inbox-zero

# Stop app
pm2 stop inbox-zero

# Delete app from PM2
pm2 delete inbox-zero

# Monitor CPU/Memory
pm2 monit
```

## Troubleshooting

### Check if app is running
```bash
pm2 list
curl http://localhost:3000
```

### Check Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### View application logs
```bash
pm2 logs inbox-zero --lines 200
```

### Restart everything
```bash
pm2 restart inbox-zero
sudo systemctl restart nginx
```

### Check port 3000
```bash
sudo lsof -i :3000
```

## DNS Configuration

Make sure your DNS records point to your Ubuntu server:

```
A Record:    angri.nl          → YOUR_SERVER_IP
A Record:    www.angri.nl      → YOUR_SERVER_IP
A Record:    hr.angri.nl       → YOUR_SERVER_IP
A Record:    cs.angri.nl       → YOUR_SERVER_IP
A Record:    marketing.angri.nl → YOUR_SERVER_IP
```

Or use a wildcard:
```
A Record:    angri.nl    → YOUR_SERVER_IP
A Record:    *.angri.nl  → YOUR_SERVER_IP
```

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Updating the Application

When you make changes:

```bash
cd /root/inbox-zero

# Pull latest changes
git pull

# Install dependencies (if needed)
pnpm install

# Rebuild
pnpm build

# Restart
pm2 restart inbox-zero
```

## Performance Optimization

### Increase Node.js memory (if needed)
```bash
pm2 delete inbox-zero
pm2 start npm --name "inbox-zero" --node-args="--max-old-space-size=4096" -- start
pm2 save
```

### Enable PM2 clustering (multiple instances)
```bash
pm2 delete inbox-zero
pm2 start npm --name "inbox-zero" -i max -- start
pm2 save
```

## Summary

✅ **You DON'T need Vercel** - you're running on your own server
✅ **PM2** keeps your app running 24/7
✅ **Nginx** handles web traffic and SSL
✅ **Your changes are LIVE** on your server at angri.nl

The app is running directly from your GitHub repository on your Ubuntu server!
