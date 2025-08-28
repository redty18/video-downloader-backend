# Vid Downloader Backend

Express + TypeScript backend that downloads Instagram/TikTok videos (MP4) using `yt-dlp` and extracts audio (MP3). Stores metadata and provides direct access to downloaded files.

## Features

- 🎥 Download Instagram Reels and TikTok videos as MP4
- 🎵 Extract audio as MP3 files
- 📱 Platform detection (Instagram/TikTok)
- 🔒 Cookie-based authentication support
- 📊 JSON metadata storage
- 🌐 Static file serving for downloads and audio
- ⚙️ Simple configuration with sensible defaults
- 📝 **Enterprise-grade logging with request tracking**
- 🔍 **Detailed error categorization and user-friendly messages**
- 📊 **Comprehensive health monitoring and system status**
- ⚡ **Performance tracking and response time monitoring**
- 🆔 **Request ID tracking for debugging and support**

## Requirements

- Node.js 18+
- `yt-dlp` installed and available on PATH
- `ffmpeg` installed and available on PATH (for audio extraction)

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd vid-downloader-backend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build and run production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DOWNLOADS_DIR` | `downloads` | Video storage directory |
| `AUDIOS_DIR` | `audios` | Audio storage directory |
| `DATA_DIR` | `data` | Metadata storage directory |

## API Endpoints

### Health Check
```http
GET /health
```
Returns comprehensive system status including:
- System uptime and memory usage
- Directory accessibility and health
- Disk space information
- Timestamp and environment details

### Download Video
```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.instagram.com/reel/DIu1Kh5uMxW/"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully downloaded instagram video and extracted audio",
  "data": {
    "id": "uuid",
    "platform": "instagram",
    "videoPath": "path/to/video.mp4",
    "audioPath": "path/to/audio.mp3",
    "audioUrl": "https://...",
    "title": "Video title",
    "publishedAt": "20250422",
    "createdAt": "2025-08-28T14:44:17.551Z"
  },
  "metadata": {
    "requestId": "abc123",
    "duration": "1500ms",
    "timestamp": "2025-08-28T16:30:00.000Z",
    "platform": "instagram",
    "fileSize": {
      "video": "Available",
      "audio": "Available"
    }
  }
}
```

### File Access
- Videos: `GET /downloads/<filename>`
- Audio: `GET /audios/<filename>`

## File Structure

```
├── downloads/          # MP4 video files
├── audios/            # MP3 audio files  
├── data/              # JSON metadata storage
├── src/
│   ├── routes/        # API endpoints
│   ├── services/      # yt-dlp integration
│   └── storage/       # JSON file storage
└── package.json
```

## Error Handling

The API provides enterprise-grade error handling with:

### HTTP Status Codes
- **400**: Validation Error - Invalid request format
- **403**: Access Error - Content requires authentication
- **404**: Not Found Error - Content unavailable
- **422**: Extraction Error - Video processing failed
- **500**: Internal Server Error - System error
- **503**: Service Unavailable - Network/connection issues

### Error Response Format
```json
{
  "error": "ExtractionError",
  "message": "Video extraction failed. The content may be private or unavailable.",
  "details": "Technical error details",
  "timestamp": "2025-08-28T16:30:00.000Z",
  "requestId": "abc123",
  "path": "/api/download",
  "duration": "2500ms",
  "suggestions": [
    "Verify the URL is correct and accessible",
    "Check if the content is public",
    "Ensure you have a stable internet connection"
  ]
}
```

### Request Tracking
- Every request gets a unique `requestId` for debugging
- Response times are tracked and logged
- Detailed error context for support teams

## Development

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Production start
npm start
```

## Logging & Monitoring

### Request Logging
- **Timestamps**: ISO format for all log entries
- **Request IDs**: Unique identifier for each request
- **Performance**: Response time tracking for every endpoint
- **Status Tracking**: Visual indicators (✅ ⚠️ ❌) for response status

### Console Output Example
```
[2025-08-28T16:30:00.000Z] 🚀 Vid Downloader API started
[2025-08-28T16:30:00.000Z] 📍 Server: http://localhost:3000
[2025-08-28T16:30:00.000Z] [abc123] POST /api/download - Started
[2025-08-28T16:30:00.000Z] [abc123] 🎬 Starting download for: https://...
[2025-08-28T16:30:00.000Z] [abc123] ✅ Download completed for: instagram
[2025-08-28T16:30:00.000Z] [abc123] POST /api/download - ✅ 200 (1500ms)
```

### Health Monitoring
- **System Status**: Uptime, memory usage, process info
- **Directory Health**: File system accessibility checks
- **Performance Metrics**: Response times and error rates
- **Real-time Monitoring**: Live system status via `/health` endpoint

## Deployment

1. **Set custom port (optional):**
   ```bash
   export PORT=8080
   ```

2. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

3. **Process management (recommended):**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start dist/index.js --name "vid-downloader"
   pm2 startup
   pm2 save
   ```

## Troubleshooting

### yt-dlp not found
```bash
# Install via pip
python -m pip install --user -U yt-dlp

# Add to PATH (Windows)
# Add %APPDATA%\Python\Python312\Scripts to PATH
```

### ffmpeg not found
```bash
# Windows: Download from https://ffmpeg.org/download.html
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

### Private Content
- Keep Chrome/Edge open and logged into the platform
- The service automatically uses browser cookies

## Security Notes

- No authentication by default
- Consider adding rate limiting for production
- File access is public via static routes
- Validate URLs before processing

## License

[Tasty LLC]
