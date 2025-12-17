#!/bin/bash

echo "🧠 Setting up AI Learning System..."
echo ""

cd /root/inbox-zero/apps/web

echo "📦 Step 1: Running Prisma migration..."
npx prisma migrate dev --name add_ai_learning

echo ""
echo "🔄 Step 2: Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ AI Learning System setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your dev server: pnpm dev"
echo "2. Navigate to Email Assistant page"
echo "3. Accept the learning consent banner"
echo "4. Start chatting to collect training data!"
echo ""
echo "📖 Read the full guide: AI_LEARNING_SYSTEM_GUIDE.md"
