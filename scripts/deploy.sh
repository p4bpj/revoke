#!/bin/bash

# Deployment script for Kasplex Revoke
set -e

echo "🚀 Starting Kasplex Revoke deployment..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_RPC_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_RPC_URL environment variable is not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_CHAIN_ID" ]; then
    echo "❌ Error: NEXT_PUBLIC_CHAIN_ID environment variable is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "🎉 Kasplex Revoke is ready for deployment!"

# If running in production, start the server
if [ "$NODE_ENV" = "production" ]; then
    echo "🚀 Starting production server..."
    npm start
fi