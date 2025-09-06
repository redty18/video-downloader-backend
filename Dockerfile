FROM node:18-alpine

# Install Python and FFmpeg
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    && ln -sf python3 /usr/bin/python

# Install yt-dlp
RUN pip3 install yt-dlp

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create directories for downloads
RUN mkdir -p downloads audios data

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
