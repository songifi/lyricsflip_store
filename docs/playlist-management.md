# Playlist System Documentation

## Overview

This playlist system provides comprehensive functionality for creating, managing, and sharing music playlists in a NestJS application. It supports both manual and smart playlists, collaborative editing, privacy controls, and detailed analytics.

## Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete playlists
- **Track Management**: Add, remove, and reorder tracks in playlists
- **Privacy Controls**: Public, private, and unlisted playlist visibility
- **Collaborative Playlists**: Multiple users can edit playlists together
- **Smart Playlists**: Auto-generated playlists based on criteria
- **Following System**: Users can follow and unfollow playlists
- **Sharing**: Generate shareable links for playlists
- **Analytics**: Comprehensive playlist and user analytics

### Playlist Types

#### Manual Playlists
- User-curated track collections
- Full control over track order and selection
- Support for collaborative editing

#### Smart Playlists
- Auto-generated based on criteria such as:
  - Genres
  - Artists
  - Duration ranges
  - Release year ranges
  - Mood and energy levels
- Automatically update when new tracks match criteria

### Privacy Levels

1. **Public**: Visible to all users, searchable
2. **Private**: Only visible to owner and collaborators
3. **Unlisted**: Accessible via direct link, not searchable

### Collaborative Features

- **Editor Role**: Can add/remove tracks and modify playlist details
- **Viewer Role**: Can view playlist but not modify
- **Owner Controls**: Only owners can add/remove collaborators and delete playlists

## API Endpoints

### Playlist Management

\`\`\`typescript
// Create playlist
POST /playlists
Body: CreatePlaylistDto

// Get all playlists (with filtering)
GET /playlists?search=query&privacy=public&page=1&limit=20

// Get specific playlist
GET /playlists/:id

// Get playlist by share token
GET /playlists/share/:shareToken

// Update playlist
PATCH /playlists/:id
Body: UpdatePlaylistDto

// Delete playlist
DELETE /playlists/:id
\`\`\`

### Track Management

\`\`\`typescript
// Add track to playlist
POST /playlists/:id/tracks
Body: { trackId: string, position?: number }

// Remove track from playlist
DELETE /playlists/:id/tracks/:trackId

// Reorder tracks
PATCH /playlists/:id/tracks/reorder
Body: { trackIds: string[] }
\`\`\`

### Collaboration

\`\`\`typescript
// Add collaborator
POST /playlists/:id/collaborators
Body: { userId: string, role?: 'editor' | 'viewer' }

// Remove collaborator
DELETE /playlists/:id/collaborators/:collaboratorId
\`\`\`

### Following

\`\`\`typescript
// Follow playlist
POST /playlists/:id/follow

// Unfollow playlist
DELETE /playlists/:id/follow

// Get followed playlists
GET /playlists/followed
\`\`\`

### User Playlists

\`\`\`typescript
// Get current user's playlists
GET /playlists/my

// Increment play count
POST /playlists/:id/play
\`\`\`

## Database Schema

### Core Tables

1. **playlists**: Main playlist information
2. **playlist_tracks**: Track associations with position ordering
3. **playlist_collaborators**: Collaborative access management
4. **playlist_follows**: User following relationships

### Key Relationships

- Playlist → User (creator)
- Playlist → PlaylistTrack (one-to-many)
- PlaylistTrack → Track (many-to-one)
- Playlist → PlaylistCollaborator (one-to-many)
- Playlist → PlaylistFollow (one-to-many)

## Smart Playlist Criteria

Smart playlists support the following criteria:

\`\`\`typescript
interface SmartCriteria {
  genres?: string[];           // Filter by genre names
  artists?: string[];          // Filter by artist IDs
  minDuration?: number;        // Minimum track duration (seconds)
  maxDuration?: number;        // Maximum track duration (seconds)
  minReleaseYear?: number;     // Minimum release year
  maxReleaseYear?: number;     // Maximum release year
  mood?: string[];             // Filter by mood tags
  energy?: {                   // Energy level range
    min: number;
    max: number;
  };
  limit?: number;              // Maximum number of tracks
}
\`\`\`

## Security & Access Control

### Authentication
- JWT-based authentication for protected endpoints
- Optional authentication for public content access

### Authorization
- Owner-based permissions for playlist management
- Role-based access for collaborators
- Privacy-level enforcement

### Guards
- `JwtAuthGuard`: Requires authentication
- `OptionalJwtAuthGuard`: Optional authentication
- `PlaylistAccessGuard`: Playlist-specific access control

## Analytics

### Platform Analytics
- Total playlists and tracks
- User engagement metrics
- Popular playlists
- Growth trends
- Privacy distribution

### User Analytics
- Personal playlist statistics
- Most popular user playlists
- Collaboration metrics

## Usage Examples

### Creating a Manual Playlist

\`\`\`typescript
const playlist = await playlistsService.create({
  name: "My Favorite Songs",
  description: "A collection of my all-time favorites",
  privacy: PlaylistPrivacy.PUBLIC,
  type: PlaylistType.MANUAL,
  isCollaborative: false
}, userId);
\`\`\`

### Creating a Smart Playlist

\`\`\`typescript
const smartPlaylist = await playlistsService.create({
  name: "Chill Electronic",
  type: PlaylistType.SMART,
  smartCriteria: {
    genres: ["electronic", "ambient"],
    energy: { min: 0.2, max: 0.6 },
    limit: 50
  }
}, userId);
\`\`\`

### Adding Collaborators

\`\`\`typescript
await playlistsService.addCollaborator(playlistId, {
  userId: collaboratorId,
  role: CollaboratorRole.EDITOR
}, ownerId);
\`\`\`

## Error Handling

The system includes comprehensive error handling for:
- Authentication and authorization failures
- Resource not found scenarios
- Validation errors
- Conflict situations (duplicate tracks, existing collaborators)
- Permission violations

## Performance Considerations

- Database indexes on frequently queried fields
- Pagination for large result sets
- Efficient query building with TypeORM
- Optimized smart playlist generation
- Cached analytics where appropriate

## Installation & Setup

1. Import the PlaylistsModule into your main application module
2. Run the database migrations to create required tables
3. Ensure proper authentication guards are configured
4. Configure any environment variables for external services

\`\`\`typescript
@Module({
  imports: [
    // ... other modules
    PlaylistsModule,
  ],
})
export class AppModule {}
\`\`\`

This playlist system provides a robust foundation for music playlist functionality with enterprise-level features and scalability considerations.
