#!/bin/bash

# Build script for Vercel deployment
# This ensures Prisma Client is generated before Next.js build

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🏗️ Building Next.js application..."
npm run build:next

echo "✅ Build completed successfully!"
