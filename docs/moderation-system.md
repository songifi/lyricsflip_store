# Content Moderation System Documentation

## Overview

The content moderation system provides comprehensive tools for reviewing, flagging, and managing user-generated content across the music platform. It includes automated scanning, manual review workflows, user flagging, appeals processes, and detailed analytics.

## Architecture

### Core Components

1. **Content Scanning Service** - Automated analysis of content for violations
2. **Moderation Workflow Service** - Manages the review process and case lifecycle
3. **User Flagging Service** - Handles community-driven content reporting
4. **Appeal Service** - Manages the appeal process for moderation decisions
5. **Analytics Service** - Tracks moderation performance and generates insights
6. **Team Management Service** - Manages moderation team members and permissions

### Database Schema

The system uses the following main entities:

- `ModerationCase` - Central entity representing a content review case
- `ContentFlag` - User-generated reports of problematic content
- `ModerationAction` - Actions taken by moderators on cases
- `Appeal` - Appeals submitted against moderation decisions
- `ModerationTeamMember` - Team members with moderation permissions
- `ModerationRule` - Automated rules for content processing
- `ModerationAnalytics` - Performance metrics and statistics

## Content Types Supported

- **Tracks** - Audio files and metadata
- **Albums** - Album information and artwork
- **Playlists** - Playlist content and descriptions
- **User Profiles** - User profile information and images
- **Artist Profiles** - Artist information and media
- **Comments** - User comments and reviews
- **Images** - Profile pictures, album artwork, etc.

## Violation Types

- **Explicit Content** - Adult or sexually explicit material
- **Copyright Infringement** - Unauthorized use of copyrighted material
- **Hate Speech** - Content promoting hatred or discrimination
- **Spam** - Unwanted promotional or repetitive content
- **Inappropriate Content** - Content not suitable for the platform
- **Violence** - Content depicting or promoting violence
- **Harassment** - Content targeting individuals with abuse
- **Fake Content** - Misleading or false information

## Workflow Process

### 1. Content Submission
- Content is automatically scanned upon upload/creation
- Automated rules determine if manual review is required
- High-confidence violations may be auto-rejected
- Low-risk content may be auto-approved

### 2. Manual Review
- Cases requiring human review are queued for moderators
- Cases are prioritized based on violation type and confidence score
- Moderators can approve, reject, or escalate cases
- All actions are logged with reasoning

### 3. User Flagging
- Users can flag content they believe violates policies
- Multiple flags on the same content trigger automatic review
- Flag patterns are analyzed to identify problematic content

### 4. Appeals Process
- Users can appeal rejected content decisions
- Appeals are reviewed by senior moderators
- Decisions can be overturned if justified
- All appeal decisions are final

## API Endpoints

### Content Moderation

\`\`\`typescript
POST /moderation/cases - Create a new moderation case
GET /moderation/cases - Get pending cases for review
GET /moderation/cases/:id - Get specific case details
PUT /moderation/cases/:id/assign - Assign case to moderator
POST /moderation/actions - Take action on a case
PUT /moderation/cases/:id/escalate - Escalate case to senior moderator
\`\`\`

### User Flagging

\`\`\`typescript
POST /moderation/flags - Flag content as inappropriate
GET /moderation/flags/content/:type/:id - Get flags for specific content
GET /moderation/flags/user/:id - Get user's flagging history
\`\`\`

### Appeals

\`\`\`typescript
POST /moderation/appeals - Submit an appeal
GET /moderation/appeals - Get pending appeals (moderators only)
GET /moderation/appeals/user/:id - Get user's appeals
PUT /moderation/appeals/:id/review - Review an appeal (moderators only)
\`\`\`

### Analytics

\`\`\`typescript
GET /moderation/analytics - Get moderation analytics
GET /moderation/analytics/dashboard - Get dashboard metrics
\`\`\`

### Team Management

\`\`\`typescript
POST /moderation/team - Add team member
PUT /moderation/team/:id - Update team member
DELETE /moderation/team/:id - Remove team member
GET /moderation/team - Get all team members
\`\`\`

## Configuration

### Environment Variables

\`\`\`bash
# Content scanning settings
CONTENT_SCAN_ENABLED=true
CONTENT_SCAN_CONFIDENCE_THRESHOLD=0.7
AUTO_APPROVE_THRESHOLD=0.3
AUTO_REJECT_THRESHOLD=0.9

# External service integrations
AWS_REKOGNITION_ENABLED=true
GOOGLE_VISION_API_KEY=your_api_key
PERSPECTIVE_API_KEY=your_api_key

# Moderation settings
FLAG_THRESHOLD=3
APPEAL_DEADLINE_DAYS=30
MAX_APPEALS_PER_CASE=1
\`\`\`

### Moderation Rules

Rules can be configured to automatically handle common scenarios:

\`\`\`json
{
  "name": "Auto-reject explicit audio",
  "applicableContentTypes": ["track"],
  "violationType": "explicit_content",
  "conditions": {
    "confidenceScore": { "gte": 0.9 },
    "scanResults.explicitContent": true
  },
  "actions": {
    "autoReject": true,
    "notifyUser": true
  },
  "confidenceThreshold": 0.9
}
\`\`\`

## Integration with Existing Modules

### Music Module Integration

\`\`\`typescript
// In your track upload service
import { ModerationService } from '../moderation/moderation.service';

async uploadTrack(trackData: any, audioFile: any) {
  // Upload track
  const track = await this.trackRepository.save(trackData);
  
  // Create moderation case
  await this.moderationService.createModerationCase({
    contentType: ContentType.TRACK,
    contentId: track.id,
    isAutomated: true,
  }, {
    title: track.title,
    description: track.description,
    audioFile: audioFile,
    isExplicit: track.isExplicit,
  });
  
  return track;
}
\`\`\`

### User Module Integration

\`\`\`typescript
// In your user profile service
async updateProfile(userId: string, profileData: any) {
  // Update profile
  const user = await this.userRepository.save(profileData);
  
  // Moderate profile changes
  await this.moderationService.createModerationCase({
    contentType: ContentType.USER_PROFILE,
    contentId: userId,
    isAutomated: true,
  }, profileData);
  
  return user;
}
\`\`\`

## Monitoring and Alerts

### Key Metrics to Monitor

- **Queue Length** - Number of pending cases
- **Processing Time** - Average time to resolve cases
- **Accuracy Rate** - Percentage of correct automated decisions
- **Appeal Rate** - Percentage of decisions that are appealed
- **Overturn Rate** - Percentage of appeals that are successful

### Alerts

Set up alerts for:
- Queue length exceeding threshold (>100 pending cases)
- Processing time exceeding SLA (>24 hours)
- High appeal rate (>10%)
- System errors in content scanning

## Best Practices

### For Moderators

1. **Consistency** - Apply policies uniformly across all content
2. **Documentation** - Always provide clear reasoning for decisions
3. **Escalation** - When in doubt, escalate to senior moderators
4. **Timeliness** - Process cases within SLA timeframes
5. **Bias Awareness** - Be aware of potential biases in decision-making

### For Developers

1. **Performance** - Optimize scanning for large files
2. **Scalability** - Design for high-volume content processing
3. **Reliability** - Implement proper error handling and retries
4. **Privacy** - Ensure sensitive content is handled securely
5. **Auditability** - Log all actions for compliance and debugging

## Compliance and Legal

### Data Retention

- Moderation cases: Retained for 2 years
- User flags: Retained for 1 year
- Appeals: Retained for 3 years
- Analytics: Aggregated data retained indefinitely

### Privacy Considerations

- Personal data in moderation cases is protected
- Access is restricted to authorized team members
- Data is anonymized in analytics where possible
- Users can request deletion of their flagging history

### Regulatory Compliance

The system supports compliance with:
- GDPR (Right to be forgotten, data portability)
- DMCA (Copyright takedown procedures)
- Platform-specific content policies
- Local content regulations

## Troubleshooting

### Common Issues

1. **High False Positive Rate**
   - Adjust confidence thresholds
   - Retrain scanning models
   - Review and update moderation rules

2. **Slow Processing**
   - Scale up moderation team
   - Optimize scanning algorithms
   - Implement better case prioritization

3. **User Complaints**
   - Review appeal decisions
   - Provide clearer policy documentation
   - Improve communication with users

### Performance Optimization

- Use database indexes for common queries
- Implement caching for frequently accessed data
- Batch process analytics calculations
- Use background jobs for heavy scanning operations
