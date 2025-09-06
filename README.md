# Video Downloader Backend

A modern web application for downloading videos from Instagram and TikTok.

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd video-downloader-backend
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

## Manual Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- FFmpeg

### Backend Setup
```bash
npm install
npm run build:backend
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
```

## Deployment Options

### 1. Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### 2. Render
- Connect your GitHub repository
- Set build command: `npm run build`
- Set start command: `npm start`
- Set environment variables: `NODE_ENV=production`

### 3. DigitalOcean App Platform
- Connect your GitHub repository
- Set build command: `npm run build`
- Set start command: `npm start`
- Set environment variables: `NODE_ENV=production`

### 4. VPS/Server
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm python3 python3-pip ffmpeg

# Install yt-dlp
pip3 install yt-dlp

# Clone and setup
git clone <your-repo-url>
cd video-downloader-backend
npm install
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "video-downloader" -- start
pm2 startup
pm2 save
```

## Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: Frontend URL for CORS in production (default: http://localhost:3000)
- `DOWNLOADS_DIR`: Directory for downloaded videos (default: downloads)
- `AUDIOS_DIR`: Directory for extracted audio files (default: audios)
- `DATA_DIR`: Directory for application data (default: data)

## Features

- 🎬 Download videos from Instagram and TikTok
- 🎵 Extract audio files (MP3)
- 📱 Modern, responsive UI
- ⚡ Real-time server status
- 🔄 Cross-platform compatibility

## API Endpoints

- `GET /health` - Server health check
- `POST /api/download` - Download video
- `GET /downloads/:filename` - Serve video files
- `GET /audios/:filename` - Serve audio files

## License

MIT License