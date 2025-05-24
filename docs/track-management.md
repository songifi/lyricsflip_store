# Track Management System Documentation

## Overview

The Track Management System provides comprehensive audio file management and streaming capabilities for the music platform. It handles track creation, audio processing, metadata extraction, and streaming functionality.

## Features

### Core Functionality
- **Track Entity Management**: Complete CRUD operations for tracks
- **Audio File Upload**: Secure upload and storage of audio files
- **Metadata Extraction**: Automatic extraction of audio metadata (duration, bitrate, format)
- **Preview Generation**: Automatic generation of 30-second preview clips
- **Waveform Generation**: Visual waveform data for audio visualization
- **Format Conversion**: Support for multiple audio formats (MP3, WAV, FLAC, AAC, OGG)

### Track Identification
- **ISRC Support**: International Standard Recording Code management
- **UPC Codes**: Universal Product Code support
- **Track Numbering**: Track and disc number management
- **Checksum Validation**: MD5 hash verification for file integrity

### Metadata Management
- **Comprehensive Metadata**: Title, description, duration, bitrate, sample rate
- **Credits System**: Support for composers, lyricists, producers, engineers, performers
- **Lyrics Management**: Full lyrics storage and retrieval
- **Copyright Information**: Copyright owner, year, and notice management

### Publishing & Distribution
- **Release Management**: Release date and label information
- **Status Management**: Draft, processing, published, archived states
- **Pricing**: Flexible pricing with currency support
- **Content Flags**: Explicit content marking, download/streaming permissions

### Analytics & Streaming
- **Play Tracking**: Real-time play count tracking
- **Download Tracking**: Download count monitoring
- **Revenue Tracking**: Revenue calculation and tracking
- **Streaming Controls**: Fine-grained streaming permissions

## API Endpoints

### Track Management
\`\`\`
POST   /tracks                    # Create new track with audio file
GET    /tracks                    # List tracks with filtering
GET    /tracks/:id                # Get specific track
PATCH  /tracks/:id                # Update track metadata
DELETE /tracks/:id                # Delete track and associated files
\`\`\`

### Track Actions
\`\`\`
POST   /tracks/:id/play           # Increment play count
POST   /tracks/:id/download       # Increment download count
PATCH  /tracks/:id/status         # Update track status
POST   /tracks/:id/preview        # Generate preview clip
POST   /tracks/:id/waveform       # Generate waveform data
\`\`\`

## Database Schema

### Track Entity Fields

#### Basic Information
- `id`: UUID primary key
- `title`: Track title (required)
- `description`: Optional track description
- `artistId`: Reference to artist (required)
- `albumId`: Optional album reference
- `genreId`: Optional genre reference

#### Audio File Information
- `audioFileUrl`: URL to original audio file
- `audioFileKey`: Storage key for original file
- `previewUrl`: URL to preview clip
- `previewKey`: Storage key for preview
- `waveformUrl`: URL to waveform data

#### Audio Metadata
- `duration`: Track duration in seconds
- `bitrate`: Audio bitrate in kbps
- `sampleRate`: Sample rate in Hz
- `format`: Audio format (MP3, WAV, FLAC, AAC, OGG)
- `fileSize`: File size in bytes
- `checksum`: MD5 hash for integrity

#### Track Identification
- `isrc`: International Standard Recording Code (unique)
- `upc`: Universal Product Code
- `trackNumber`: Track number on album
- `discNumber`: Disc number for multi-disc releases

#### Content & Credits
- `lyrics`: Full track lyrics
- `credits`: JSON object with role-based credits
- `copyrightInfo`: Copyright owner and year information

#### Publishing
- `releaseDate`: Official release date
- `label`: Record label
- `publisher`: Publishing company
- `status`: Current track status
- `isExplicit`: Explicit content flag

#### Analytics
- `playCount`: Total play count
- `downloadCount`: Total download count
- `revenue`: Generated revenue

#### Permissions & Pricing
- `allowDownload`: Download permission flag
- `allowStreaming`: Streaming permission flag
- `price`: Track price
- `currency`: Price currency

## Usage Examples

### Creating a Track
\`\`\`typescript
const formData = new FormData();
formData.append('audioFile', audioFile);
formData.append('title', 'My New Track');
formData.append('artistId', 'artist-uuid');
formData.append('description', 'Track description');

const response = await fetch('/tracks', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
\`\`\`

### Querying Tracks
\`\`\`typescript
const tracks = await fetch('/tracks?' + new URLSearchParams({
  artistId: 'artist-uuid',
  status: 'published',
  page: '1',
  limit: '20',
  sortBy: 'createdAt',
  sortOrder: 'DESC'
}));
\`\`\`

### Updating Track Metadata
\`\`\`typescript
const updatedTrack = await fetch(`/tracks/${trackId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    title: 'Updated Title',
    lyrics: 'Updated lyrics...',
    credits: {
      composers: ['John Doe'],
      producers: ['Jane Smith']
    }
  })
});
\`\`\`

## Audio Processing Pipeline

### 1. Upload & Validation
- File format validation
- File size limits (max 100MB)
- MIME type verification

### 2. Metadata Extraction
- Duration calculation
- Bitrate detection
- Sample rate identification
- Format recognition

### 3. File Storage
- Secure upload to cloud storage
- Unique key generation
- URL generation for access

### 4. Async Processing
- Preview generation (30-second clip from middle)
- Waveform data generation
- Format conversion (if needed)

### 5. Status Updates
- Processing status tracking
- Error handling and reporting
- Completion notifications

## Security Considerations

### File Access Control
- Private audio files with signed URLs
- Time-limited access tokens
- Role-based access control

### Data Validation
- Comprehensive input validation
- File type restrictions
- Size limitations

### Error Handling
- Graceful error recovery
- Detailed error logging
- User-friendly error messages

## Performance Optimizations

### Database Indexes
- Composite indexes for common queries
- Full-text search on titles
- Optimized foreign key relationships

### Caching Strategy
- Metadata caching
- Signed URL caching
- Query result caching

### Async Processing
- Background audio processing
- Queue-based task management
- Progress tracking

## Configuration

### Environment Variables
\`\`\`
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-audio-bucket
\`\`\`

### Dependencies
- `fluent-ffmpeg`: Audio processing
- `aws-sdk`: File storage
- `typeorm`: Database ORM
- `class-validator`: Input validation

## Monitoring & Analytics

### Key Metrics
- Upload success rate
- Processing completion time
- Storage usage
- Play/download counts

### Logging
- Structured logging with context
- Error tracking and alerting
- Performance monitoring

## Future Enhancements

### Planned Features
- Real-time audio streaming
- Advanced audio effects
- Collaborative editing
- AI-powered metadata extraction
- Multi-language lyrics support

### Scalability Improvements
- CDN integration
- Distributed processing
- Microservice architecture
- Event-driven updates
