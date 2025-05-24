# Video Content Management System

A comprehensive video content management system for your NestJS music platform, featuring video upload, processing, streaming, analytics, and SEO optimization.

## Features

### Core Video Management
- **Video Entity Management**: Complete CRUD operations for videos with metadata
- **Multi-format Support**: Handles various video formats (MP4, AVI, MOV, WebM, etc.)
- **Video-Track Linking**: Associate videos with music tracks and artists
- **Status Tracking**: Upload, processing, ready, failed, and archived states

### Video Processing
- **Automatic Transcoding**: Convert videos to multiple quality levels (360p to 4K)
- **Thumbnail Generation**: Automatic thumbnail and poster image creation
- **Metadata Extraction**: Duration, resolution, bitrate, codec information
- **Background Processing**: Asynchronous video processing with status updates

### Streaming & Playback
- **Adaptive Streaming**: Multiple quality options for different bandwidths
- **Progressive Download**: Efficient video delivery
- **Embed Support**: Embeddable video player for external sites
- **Mobile Optimization**: Responsive video playback

### Analytics & Tracking
- **View Analytics**: Comprehensive view tracking and analytics
- **User Engagement**: Watch duration, completion rates, interaction metrics
- **Geographic Data**: Country and city-based analytics
- **Device Analytics**: Browser, device, and platform tracking
- **Trending Algorithm**: Identify trending videos based on recent performance

### SEO Optimization
- **Meta Tags**: Automatic generation of SEO-friendly meta tags
- **Structured Data**: Schema.org VideoObject markup
- **Social Media**: Open Graph and Twitter Card optimization
- **Keyword Optimization**: Automatic keyword extraction and optimization
- **Sitemap Integration**: Video sitemap generation for search engines

## Installation

1. **Install Dependencies**
\`\`\`bash
npm install fluent-ffmpeg @types/fluent-ffmpeg
\`\`\`

2. **Install FFmpeg**
\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
\`\`\`

3. **Add to App Module**
\`\`\`typescript
import { VideoModule } from './modules/videos/video.module';

@Module({
  imports: [
    // ... other modules
    VideoModule,
  ],
})
export class AppModule {}
\`\`\`

4. **Run Migrations**
\`\`\`bash
npm run migration:run
\`\`\`

5. **Environment Variables**
\`\`\`env
# Video Configuration
VIDEO_UPLOAD_PATH=./uploads/videos
VIDEO_PROCESSED_PATH=./processed/videos
VIDEO_THUMBNAIL_PATH=./thumbnails
MAX_VIDEO_SIZE=524288000
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe

# Streaming
VIDEO_STREAMING_BASE_URL=http://localhost:3000

# Analytics
ENABLE_GEO_LOCATION=false
\`\`\`

## API Endpoints

### Video Management
- `POST /videos` - Create new video
- `GET /videos` - List videos with filtering
- `GET /videos/:id` - Get video details
- `PATCH /videos/:id` - Update video
- `DELETE /videos/:id` - Delete video

### Upload & Processing
- `POST /videos/:id/upload` - Upload video file
- `GET /videos/:id/stream` - Get streaming URLs

### Analytics
- `POST /videos/:id/view` - Record video view
- `GET /videos/:id/analytics` - Get video analytics

### Discovery
- `GET /videos/featured` - Get featured videos
- `GET /videos/trending` - Get trending videos
- `GET /videos/track/:trackId` - Get videos for track
- `GET /videos/artist/:artistId` - Get videos for artist

### SEO & Embedding
- `GET /videos/:id/seo` - Get SEO metadata
- `GET /videos/:id/embed` - Embeddable player

## Usage Examples

### Creating a Video
\`\`\`typescript
const video = await videoService.create({
  title: 'My Music Video',
  description: 'Official music video',
  type: VideoType.MUSIC_VIDEO,
  artistId: 'artist-uuid',
  trackId: 'track-uuid',
  tags: ['rock', 'alternative', '2024'],
  isPublic: true,
}, userId);
\`\`\`

### Uploading Video File
\`\`\`typescript
const uploadedVideo = await videoService.uploadVideo(
  videoId,
  videoFile
);
\`\`\`

### Getting Stream Data
\`\`\`typescript
const streamData = await videoService.getVideoStream(
  videoId,
  '1080p' // optional quality
);
\`\`\`

### Recording Analytics
\`\`\`typescript
await videoAnalyticsService.recordView(
  videoId,
  userId,
  ipAddress,
  userAgent,
  watchDuration,
  completionPercentage
);
\`\`\`

## Database Schema

### Videos Table
- Basic video information and metadata
- Processing status and file paths
- SEO and analytics counters
- Relationships to tracks, artists, and users

### Video Qualities Table
- Multiple quality versions of each video
- File paths, sizes, and technical specifications
- Processing status for each quality

### Video Views Table
- Individual view records for analytics
- User engagement metrics
- Geographic and device information

## Processing Pipeline

1. **Upload**: Video file uploaded to temporary storage
2. **Validation**: File type and size validation
3. **Metadata Extraction**: Duration, resolution, codec information
4. **Thumbnail Generation**: Multiple thumbnail images created
5. **Quality Processing**: Multiple quality versions generated
6. **Storage**: Processed files moved to permanent storage
7. **Status Update**: Video marked as ready for streaming

## Performance Considerations

### Video Processing
- Background processing prevents blocking
- Queue system for handling multiple uploads
- Configurable quality levels based on requirements
- Cleanup of temporary files

### Streaming Optimization
- Progressive download support
- CDN integration ready
- Adaptive bitrate streaming
- Efficient file serving

### Analytics Performance
- Indexed database queries
- Aggregated analytics caching
- Batch processing for large datasets
- Geographic data optimization

## Security Features

### Access Control
- JWT authentication for uploads
- Role-based permissions
- Private video support
- Premium content restrictions

### File Security
- File type validation
- Size limitations
- Secure file paths
- Virus scanning integration ready

## Monitoring & Logging

### Processing Monitoring
- Video processing status tracking
- Error logging and alerting
- Performance metrics
- Storage usage monitoring

### Analytics Monitoring
- View tracking accuracy
- Geographic data quality
- Device detection reliability
- Performance analytics

## Integration Points

### Music Module Integration
- Automatic video-track linking
- Playlist video support
- Album video collections
- Artist video galleries

### Streaming Module Integration
- Audio-video synchronization
- Cross-platform streaming
- Quality adaptation
- Bandwidth optimization

### Analytics Module Integration
- Combined audio-video analytics
- User engagement tracking
- Revenue analytics for premium content
- Performance reporting

## Troubleshooting

### Common Issues

1. **FFmpeg Not Found**
   - Ensure FFmpeg is installed and in PATH
   - Set FFMPEG_PATH environment variable

2. **Processing Failures**
   - Check video file format compatibility
   - Verify sufficient disk space
   - Review FFmpeg logs

3. **Streaming Issues**
   - Verify file permissions
   - Check network connectivity
   - Validate video quality files

### Performance Optimization

1. **Storage Optimization**
   - Use SSD for processing
   - Implement CDN for delivery
   - Regular cleanup of old files

2. **Processing Optimization**
   - Adjust quality settings
   - Use hardware acceleration
   - Implement queue management

## Future Enhancements

- Live streaming support
- Video editing capabilities
- AI-powered content analysis
- Advanced compression algorithms
- Real-time transcoding
- Multi-language subtitle support
