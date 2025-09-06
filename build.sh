#!/bin/bash
# Render build script for video downloader

echo "🚀 Starting Render build process..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install Python and yt-dlp
echo "🐍 Installing Python dependencies..."
apt-get update
apt-get install -y python3 python3-pip ffmpeg
pip3 install yt-dlp

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
