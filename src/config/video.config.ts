export const videoConfig = {
  upload: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/mkv"],
    uploadPath: process.env.VIDEO_UPLOAD_PATH || "./uploads/videos",
    processedPath: process.env.VIDEO_PROCESSED_PATH || "./processed/videos",
    thumbnailPath: process.env.VIDEO_THUMBNAIL_PATH || "./thumbnails",
  },
  processing: {
    ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
    ffprobePath: process.env.FFPROBE_PATH || "ffprobe",
    qualities: [
      { name: "360p", width: 640, height: 360, bitrate: 800 },
      { name: "480p", width: 854, height: 480, bitrate: 1200 },
      { name: "720p", width: 1280, height: 720, bitrate: 2500 },
      { name: "1080p", width: 1920, height: 1080, bitrate: 5000 },
    ],
    thumbnailCount: 3,
    thumbnailSize: "1280x720",
  },
  streaming: {
    baseUrl: process.env.VIDEO_STREAMING_BASE_URL || "http://localhost:3000",
    chunkSize: 1024 * 1024, // 1MB chunks for streaming
  },
  analytics: {
    viewCountThreshold: 30, // seconds watched to count as a view
    enableGeoLocation: process.env.ENABLE_GEO_LOCATION === "true",
    enableDeviceDetection: true,
  },
  seo: {
    defaultKeywords: ["music", "video", "streaming", "entertainment"],
    maxTitleLength: 60,
    maxDescriptionLength: 160,
    maxKeywords: 20,
  },
}
