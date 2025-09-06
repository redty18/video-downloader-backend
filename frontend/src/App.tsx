import React, { useState, useEffect } from 'react';

// Simple API service
const API_BASE_URL = import.meta.env.PROD 
  ? window.location.origin 
  : 'http://localhost:3000';

interface DownloadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    platform: 'instagram' | 'tiktok' | 'unknown';
    inputUrl: string;
    videoPath: string;
    filename: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    audioPath?: string;
    title?: string;
    publishedAt?: string;
    createdAt: string;
  };
  metadata: {
    requestId: string;
    duration: string;
    timestamp: string;
    platform: string;
    fileSize: {
      video: string;
      audio: string;
    };
  };
}

const downloadVideo = async (url: string): Promise<DownloadResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to download video');
  }
  
  return response.json();
};

const getHealthStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Failed to get health status');
  }
  return response.json();
};

// Enhanced Download Form Component
function DownloadForm({ onDownloadComplete }: { onDownloadComplete: (result: DownloadResponse) => void }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await downloadVideo(url);
      onDownloadComplete(result);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to download video');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes('instagram.com') || url.includes('tiktok.com');
    } catch {
      return false;
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        left: '-60px',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite reverse'
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
        }}>
          📥
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Download Video
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
        <div>
          <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Video URL
          </label>
            <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram or TikTok URL here..."
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '16px',
              boxSizing: 'border-box',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.background = 'rgba(255, 255, 255, 1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.05)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
            }}
            disabled={isLoading}
          />
          {url && !isValidUrl(url) && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
              ⚠️ Please enter a valid Instagram or TikTok URL
            </p>
          )}
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)'
          }}>
            <div style={{ fontSize: '24px' }}>⚠️</div>
            <div>
              <p style={{ fontSize: '16px', color: '#991b1b', fontWeight: '600', margin: 0 }}>
                Download Failed
              </p>
              <p style={{ fontSize: '14px', color: '#b91c1c', margin: '4px 0 0 0' }}>{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!url.trim() || !isValidUrl(url) || isLoading}
          style={{
            background: isLoading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: '700',
            padding: '16px 32px',
            borderRadius: '16px',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: (!url.trim() || !isValidUrl(url)) ? 0.5 : 1,
            boxShadow: '0 16px 32px rgba(102, 126, 234, 0.4), 0 8px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateY(0)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && url.trim() && isValidUrl(url)) {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.6), 0 12px 24px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && url.trim() && isValidUrl(url)) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(102, 126, 234, 0.4), 0 8px 16px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          {isLoading ? (
            <>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                border: '3px solid transparent',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Downloading...
            </>
          ) : (
            <>
              <div style={{ fontSize: '20px' }}>📥</div>
              Download Video & Audio
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// Enhanced Download Result Component
function DownloadResult({ result }: { result: DownloadResponse }) {
  const { data, metadata } = result;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      default: return '🎬';
    }
  };

  const getPlatformGradient = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
      case 'tiktok': return 'linear-gradient(135deg, #000000 0%, #374151 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: getPlatformGradient(data.platform),
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
          }}>
            {getPlatformIcon(data.platform)}
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0, textTransform: 'capitalize' }}>
              {data.platform} Video
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: '500' }}>
              Downloaded successfully
            </p>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ fontSize: '20px' }}>✅</div>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Complete</span>
        </div>
      </div>

      {data.title && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px', fontSize: '16px' }}>Title</h4>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0, fontWeight: '500' }}>{data.title}</p>
        </div>
      )}

      {data.thumbnailUrl && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={data.thumbnailUrl}
            alt="Video thumbnail"
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              borderRadius: '16px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
          <div style={{ fontSize: '18px' }}>🕒</div>
          <span>Downloaded: {formatDate(data.createdAt)}</span>
        </div>
        {data.publishedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
            <div style={{ fontSize: '18px' }}>📅</div>
            <span>Published: {formatDate(data.publishedAt)}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px', 
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '20px' }}>🎬</div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Video File</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{metadata.fileSize.video}</span>
            <a
              href={`${API_BASE_URL}/downloads/${data.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              🔗 Open
            </a>
            <a
              href={`${API_BASE_URL}/downloads/${data.filename}`}
              download={data.filename}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
              }}
            >
              📥 Download
            </a>
          </div>
        </div>

        {data.audioPath && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', 
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '20px' }}>🎵</div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Audio File</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{metadata.fileSize.audio}</span>
              <a
                href={`${API_BASE_URL}/audios/${data.audioPath.split(/[/\\]/).pop()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  color: '#374151',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                🔗 Open
              </a>
              <a
                href={`${API_BASE_URL}/audios/${data.audioPath.split(/[/\\]/).pop()}`}
                download
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
                }}
              >
                📥 Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Health Status Component
function HealthStatus({ health }: { health: any }) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
        }}>
          📊
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Server Status
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
        {/* Status Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 8px rgba(16, 185, 129, 0.2)'
            }}>
              🖥️
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Status</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Server Health</div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'capitalize',
            boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
          }}>
            {health.status}
          </div>
        </div>

        {/* Memory Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(147, 51, 234, 0.1)',
          border: '1px solid rgba(147, 51, 234, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 8px rgba(147, 51, 234, 0.2)'
            }}>
              💾
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Memory</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Heap Usage</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              boxShadow: '0 4px 8px rgba(147, 51, 234, 0.3)',
              marginBottom: '4px'
            }}>
              {formatBytes(health.memory.heapUsed)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
              of {formatBytes(health.memory.heapTotal)}
            </div>
          </div>
        </div>

        {/* Uptime Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)'
            }}>
              ⏱️
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Uptime</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Server Runtime</div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)'
          }}>
            {formatUptime(health.uptime)}
          </div>
        </div>

        {/* Environment Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(234, 88, 12, 0.1)',
          border: '1px solid rgba(234, 88, 12, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 8px rgba(234, 88, 12, 0.2)'
            }}>
              🌍
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Environment</div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Deployment Mode</div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'capitalize',
            boxShadow: '0 4px 8px rgba(234, 88, 12, 0.3)'
          }}>
            {health.environment}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [downloads, setDownloads] = useState<DownloadResponse[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  useEffect(() => {
    loadHealthStatus();
  }, []);

  const loadHealthStatus = async () => {
    try {
      const healthData = await getHealthStatus();
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load health status:', error);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleDownloadComplete = (result: DownloadResponse) => {
    setDownloads(prev => [result, ...prev]);
  };

  const refreshHealth = () => {
    setIsLoadingHealth(true);
    loadHealthStatus();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 25s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 30s ease-in-out infinite'
      }} />
      {/* Enhanced Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
              }}>
                VD
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                Video Downloader
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a
                href={API_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                🔗 API Docs
              </a>
              <button
                onClick={refreshHealth}
                disabled={isLoadingHealth}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: isLoadingHealth ? 'not-allowed' : 'pointer',
                  opacity: isLoadingHealth ? 0.5 : 1,
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingHealth) {
                    e.currentTarget.style.color = '#667eea';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingHealth) {
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ fontSize: '18px' }}>🔄</div>
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px 24px',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          {/* Left Column - Download Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <DownloadForm onDownloadComplete={handleDownloadComplete} />
            
            {/* Download History */}
            {downloads.length > 0 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  Recent Downloads ({downloads.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {downloads.map((download) => (
                    <DownloadResult key={download.data.id} result={download} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Health Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {health && <HealthStatus health={health} />}
            
            {/* Enhanced Instructions */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '32px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                How to Use
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#667eea', fontWeight: '700', fontSize: '18px' }}>1.</span>
                  <span style={{ fontWeight: '500' }}>Paste an Instagram or TikTok video URL in the input field</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#667eea', fontWeight: '700', fontSize: '18px' }}>2.</span>
                  <span style={{ fontWeight: '500' }}>Click "Download Video & Audio" to start the process</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#667eea', fontWeight: '700', fontSize: '18px' }}>3.</span>
                  <span style={{ fontWeight: '500' }}>Wait for the download to complete (may take a few minutes)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#667eea', fontWeight: '700', fontSize: '18px' }}>4.</span>
                  <span style={{ fontWeight: '500' }}>Download or preview your files from the results</span>
                </div>
              </div>
            </div>

            {/* Enhanced Supported Platforms */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '32px'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                Supported Platforms
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)'
                  }}>
                    📷
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '18px' }}>Instagram</p>
                    <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: '500' }}>Posts, Reels, Stories</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
                  }}>
                    🎵
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', color: '#1f2937', margin: 0, fontSize: '18px' }}>TikTok</p>
                    <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: '500' }}>Videos, Music</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        marginTop: '80px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: '500' }}>
              Video Downloader Frontend - Built with React & Custom CSS
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontSize: '20px' }}>🐙</div>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add CSS animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(0, -20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default App;