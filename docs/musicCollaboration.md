# Music Collaboration System

This module provides comprehensive tools for remote music collaboration and project management.

## Features

### 🎵 Project Management
- Create collaborative music projects (tracks, albums, EPs, etc.)
- Role-based access control (Owner, Admin, Producer, Artist, Songwriter, Engineer, Viewer)
- Project status tracking and lifecycle management
- Team member invitation and management

### 🎧 Audio Version Control
- Upload and manage multiple audio versions
- Track changes between versions with detailed metadata
- Approve/reject audio versions
- Waveform visualization support
- Parent-child version relationships for complete history

### 📋 Task Management
- Create and assign tasks to team members
- Track task progress with status updates
- Set priorities and due dates
- Task dependencies management
- Time tracking (estimated vs actual hours)

### 💬 Feedback System
- Add timestamped feedback to audio versions
- Threaded comments for organized discussions
- Rating system for audio versions
- File attachments for feedback
- Status tracking (pending, acknowledged, resolved)

### ⏰ Real-time Collaboration
- Live audio playback synchronization
- Real-time cursor position sharing
- Live commenting during playback
- User presence indicators
- Activity broadcasts

### 📊 Analytics & Timeline
- Project activity timeline
- Collaboration analytics and metrics
- Member activity tracking
- Milestone tracking
- Daily/weekly/monthly reports

## API Endpoints

### Projects
\`\`\`
POST   /collaboration/projects              # Create project
GET    /collaboration/projects              # Get user projects
GET    /collaboration/projects/:id          # Get project details
POST   /collaboration/projects/:id/invite   # Invite member
PATCH  /collaboration/projects/:id/status   # Update status
\`\`\`

### Audio Versions
\`\`\`
POST   /collaboration/projects/:projectId/audio-versions/upload    # Upload audio
GET    /collaboration/projects/:projectId/audio-versions           # Get versions
PATCH  /collaboration/audio-versions/:versionId/approve            # Approve version
GET    /collaboration/audio-versions/:versionId/history            # Version history
\`\`\`

### Tasks
\`\`\`
POST   /collaboration/projects/:projectId/tasks        # Create task
GET    /collaboration/projects/:projectId/tasks        # Get project tasks
PATCH  /collaboration/tasks/:taskId/status             # Update task status
PATCH  /collaboration/tasks/:taskId/assign             # Assign task
GET    /collaboration/tasks/my-tasks                   # Get user tasks
\`\`\`

### Feedback
\`\`\`
POST   /collaboration/audio-versions/:versionId/feedback           # Add feedback
GET    /collaboration/audio-versions/:versionId/feedback           # Get feedback
PATCH  /collaboration/feedback/:feedbackId/status                 # Update feedback status
\`\`\`

## WebSocket Events

### Connection Management
\`\`\`javascript
// Join project for real-time collaboration
socket.emit('joinProject', { projectId: 'uuid' });

// Leave project
socket.emit('leaveProject');
\`\`\`

### Real-time Features
\`\`\`javascript
// Audio playback synchronization
socket.emit('audioPlaybackSync', {
  versionId: 'uuid',
  action: 'play', // 'play', 'pause', 'seek'
  timestamp: 45.2
});

// Share cursor position
socket.emit('cursorPosition', {
  versionId: 'uuid',
  position: 120.5
});

// Live commenting
socket.emit('liveComment', {
  versionId: 'uuid',
  content: 'Great transition here!',
  timestamp: 67.8,
  isTemporary: true
});
\`\`\`

## Database Schema

### Core Tables
- `projects` - Main project information
- `project_members` - Team member relationships
- `audio_versions` - Audio file versions with metadata
- `tasks` - Project tasks and assignments
- `feedback` - Audio feedback and comments
- `timeline` - Project activity timeline
- `project_analytics` - Collaboration metrics

### Key Relationships
- Projects have many members, tasks, audio versions
- Audio versions have many feedback entries
- Tasks can have dependencies on other tasks
- Timeline tracks all project activities
- Analytics aggregate daily collaboration metrics

## Usage Examples

### Creating a Project
\`\`\`typescript
const project = await projectService.createProject(userId, {
  title: 'My New Track',
  description: 'Collaborative electronic track',
  type: ProjectType.TRACK,
  settings: {
    isPublic: false,
    allowInvites: true,
    requireApproval: true,
    maxMembers: 5,
    genres: ['electronic', 'ambient'],
    tags: ['experimental', 'collaboration']
  },
  metadata: {
    bpm: 128,
    key: 'C major',
    timeSignature: '4/4'
  }
});
\`\`\`

### Uploading Audio Version
\`\`\`typescript
const audioVersion = await audioVersionService.uploadAudioVersion(
  projectId,
  userId,
  {
    title: 'Rough Mix v2',
    description: 'Added reverb to vocals',
    type: AudioVersionType.ROUGH_MIX,
    parentVersionId: 'previous-version-id',
    changes: {
      summary: 'Vocal processing improvements',
      details: ['Added reverb', 'EQ adjustments', 'Level balancing']
    }
  },
  audioFile
);
\`\`\`

### Real-time Collaboration Setup
\`\`\`javascript
// Frontend WebSocket connection
const socket = io('/collaboration', {
  auth: {
    token: authToken
  }
});

// Join project room
socket.emit('joinProject', { projectId });

// Listen for real-time events
socket.on('userJoined', (data) => {
  console.log(`${data.userName} joined the project`);
});

socket.on('audioPlaybackSync', (data) => {
  // Sync audio playback with other users
  if (data.action === 'play') {
    audioPlayer.play(data.timestamp);
  }
});
\`\`\`

## Security & Permissions

### Role-based Access Control
Each project member has specific permissions based on their role:

- **Owner/Admin**: Full project control
- **Producer/Engineer**: Task management, audio upload/download
- **Artist/Songwriter**: Audio upload, commenting
- **Viewer**: Download, commenting only

### Data Protection
- All file uploads are validated for type and size
- WebSocket connections require JWT authentication
- Project access is strictly controlled by membership
- Sensitive operations require permission checks

## Performance Considerations

### Optimizations
- Database indexes on frequently queried fields
- WebSocket room management for efficient broadcasting
- Lazy loading of audio versions and feedback
- Pagination for large datasets

### Scalability
- Stateless service design for horizontal scaling
- Redis can be added for WebSocket session management
- File storage abstraction for cloud providers
- Database connection pooling

## Integration Points

### Existing Modules
- **Users**: Member management and authentication
- **Music**: Integration with tracks and albums
- **Storage**: File upload and management
- **Notifications**: Real-time alerts and updates

### External Services
- Cloud storage for audio files (AWS S3, Google Cloud)
- CDN for fast file delivery
- Audio processing services for waveform generation
- Email notifications for project updates

## Development Setup

1. **Database Migration**
   \`\`\`bash
   npm run migration:run
   \`\`\`

2. **Environment Variables**
   \`\`\`env
   # WebSocket configuration
   WS_PORT=3001
   
   # File upload limits
   MAX_FILE_SIZE=100MB
   ALLOWED_AUDIO_FORMATS=mp3,wav,flac,aiff
   
   # Storage configuration
   STORAGE_PROVIDER=local|s3|gcs
   STORAGE_BUCKET=collaboration-files
   \`\`\`

3. **Testing**
   \`\`\`bash
   # Unit tests
   npm run test
   
   # Integration tests
   npm run test:e2e
   
   # WebSocket tests
   npm run test:ws
   \`\`\`

## Future Enhancements

### Planned Features
- **AI-powered collaboration insights**
- **Integration with DAW plugins**
- **Video call integration**
- **Advanced workflow automation**
- **Mobile app support**
- **Blockchain-based rights management**

### Technical Improvements
- **GraphQL subscriptions for real-time data**
- **Microservices architecture**
- **Advanced caching strategies**
- **Machine learning for collaboration recommendations**

## Troubleshooting

### Common Issues
1. **WebSocket connection failures**: Check JWT token and CORS settings
2. **File upload errors**: Verify file size limits and formats
3. **Permission denied**: Check user role and project membership
4. **Real-time sync issues**: Ensure stable WebSocket connection

### Monitoring
- Track WebSocket connection metrics
- Monitor file upload success rates
- Measure collaboration session duration
- Alert on high error rates

---

For more detailed documentation, see the individual service and controller files.
