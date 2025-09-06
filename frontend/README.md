# Video Downloader Frontend

A modern React frontend for the Video Downloader backend API. This application provides a user-friendly interface for downloading videos and audio from Instagram and TikTok.

## Features

- 🎬 **Video Download**: Download videos from Instagram and TikTok
- 🎵 **Audio Extraction**: Automatically extract audio from videos
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Status**: Live server health monitoring
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS
- 📁 **File Management**: Easy download and preview of files

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Video Downloader backend running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter Video URL**: Paste an Instagram or TikTok video URL in the input field
2. **Start Download**: Click "Download Video & Audio" to begin the process
3. **Wait for Completion**: The download may take a few minutes depending on file size
4. **Access Files**: Download or preview your files from the results section

## Supported Platforms

- **Instagram**: Posts, Reels, Stories
- **TikTok**: Videos, Music tracks

## API Integration

The frontend communicates with the backend API at `http://localhost:3000`:

- `POST /api/download` - Download video and extract audio
- `GET /health` - Get server status and health information
- `GET /downloads/*` - Access downloaded video files
- `GET /audios/*` - Access extracted audio files

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── DownloadForm.tsx # Main download form
│   ├── DownloadResult.tsx # Download results display
│   └── HealthStatus.tsx  # Server health monitoring
├── services/            # API services
│   └── api.ts          # API client and types
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

The API base URL can be configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.