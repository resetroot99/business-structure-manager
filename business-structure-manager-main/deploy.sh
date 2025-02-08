#!/bin/bash

# Build and deploy script
echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
cd client
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment complete!" 