#!/bin/bash
# Render build script for video downloader

echo "🚀 Starting Render build process..."

# Update package lists
echo "📦 Updating package lists..."
apt-get update

# Install system dependencies
echo "🔧 Installing system dependencies..."
apt-get install -y python3 python3-pip ffmpeg

# Install yt-dlp
echo "🐍 Installing yt-dlp..."
python3 -m pip install yt-dlp

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
