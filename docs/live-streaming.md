# Live Streaming Module

This module provides comprehensive live streaming infrastructure for concerts, studio sessions, and artist interactions.

## Features

- **Live Stream Management**: Create, schedule, and manage live streams
- **Real-time Video/Audio Streaming**: High-quality streaming with adaptive quality
- **Live Chat**: Real-time audience interaction during streams
- **Recording & Replay**: Automatic recording and replay functionality
- **Pay-per-view Events**: Revenue generation through ticket sales
- **Stream Analytics**: Comprehensive viewer metrics and analytics
- **Quality Adaptation**: Automatic quality adjustment based on connection speed

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

\`\`\`env
# Streaming Configuration
STREAMING_BASE_URL=https://stream.yourapp.com

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Third-party streaming service configurations
AWS_IVS_CHANNEL_ARN=...
AGORA_APP_ID=...
WOWZA_API_KEY=...
\`\`\`

### Database Migration

Run the migration to create the necessary tables:

\`\`\`bash
npm run migration:run
\`\`\`

### Module Import

Add the LiveStreamModule to your app.module.ts:

\`\`\`typescript
import { LiveStreamModule } from './modules/livestream/livestream.module';

@Module({
  imports: [
    // ... other modules
    LiveStreamModule,
  ],
})
export class AppModule {}
\`\`\`

## API Endpoints

### Live Stream Management

- `GET /livestreams` - Get all live streams with pagination and filtering
- `POST /livestreams` - Create a new live stream
- `GET /livestreams/:id` - Get a specific live stream
- `PATCH /livestreams/:id` - Update a live stream
- `DELETE /livestreams/:id` - Delete a live stream
- `POST /livestreams/:id/start` - Start a live stream
- `POST /livestreams/:id/end` - End a live stream

### Access Control

- `GET /livestreams/:id/access` - Check user access to a stream
- `POST /livestreams/:id/payment` - Create payment for pay-per-view stream

### Analytics

- `GET /livestreams/:id/analytics` - Get stream analytics
- `GET /livestreams/:id/revenue` - Get revenue analytics

### Chat

- `GET /livestreams/:id/chat` - Get chat history

### Stream Health

- `GET /livestreams/:id/health` - Get real-time stream health metrics
- `POST /livestreams/:id/adapt-quality` - Manually adapt stream quality

## WebSocket Events

### Client to Server

- `joinStream` - Join a live stream room
- `leaveStream` - Leave a live stream room
- `sendChatMessage` - Send a chat message
- `reportQuality` - Report streaming quality metrics

### Server to Client

- `joinedStream` - Confirmation of joining a stream
- `leftStream` - Confirmation of leaving a stream
- `viewerCountUpdate` - Updated viewer count
- `newChatMessage` - New chat message
- `streamUpdate` - Stream status updates
- `systemMessage` - System announcements
- `error` - Error messages

## Usage Examples

### Creating a Live Stream

\`\`\`typescript
const createStreamDto: CreateLiveStreamDto = {
  title: "Live Concert - Rock Night",
  description: "Amazing rock concert featuring local bands",
  type: StreamType.CONCERT,
  scheduledStartTime: "2024-12-01T20:00:00Z",
  maxViewers: 1000,
  ticketPrice: 29.99,
  isPayPerView: true,
  isChatEnabled: true,
  isRecordingEnabled: true,
  maxQuality: StreamQuality.HIGH,
  artistId: "artist-uuid-here",
  streamSettings: {
    bitrate: 5000,
    fps: 30,
    resolution: "1920x1080",
    audioCodec: "aac",
    videoCodec: "h264"
  }
};

const stream = await liveStreamService.create(createStreamDto);
\`\`\`

### Joining a Stream (WebSocket)

\`\`\`javascript
// Client-side WebSocket connection
const socket = io('/livestream');

// Join a stream
socket.emit('joinStream', {
  streamId: 'stream-uuid',
  userId: 'user-uuid'
});

// Listen for events
socket.on('joinedStream', (data) => {
  console.log('Joined stream:', data.streamId);
  console.log('Current viewers:', data.viewerCount);
});

socket.on('newChatMessage', (message) => {
  console.log('New message:', message);
});

socket.on('viewerCountUpdate', (data) => {
  console.log('Viewer count updated:', data.viewerCount);
});
\`\`\`

### Processing Payments

\`\`\`typescript
// Create payment intent
const paymentData = await paymentService.createPaymentIntent(userId, streamId);

// On payment success (webhook or client confirmation)
const confirmedPayment = await paymentService.confirmPayment(paymentData.paymentIntentId);
\`\`\`

## Architecture

### Entities

1. **LiveStream** - Main stream entity with scheduling and configuration
2. **LiveStreamRecording** - Recording files and metadata
3. **LiveStreamAnalytics** - Viewer metrics and performance data
4. **LiveStreamPayment** - Payment transactions for pay-per-view
5. **LiveStreamChat** - Chat messages and interactions

### Services

1. **LiveStreamService** - Main business logic for stream management
2. **PaymentService** - Handles payment processing with Stripe
3. **StreamingService** - Interfaces with streaming infrastructure
4. **LiveStreamGateway** - WebSocket handling for real-time features

## Integration Points

### Streaming Infrastructure

The module is designed to work with various streaming services:

- **AWS IVS** - For managed live streaming
- **Agora** - For real-time communication
- **Wowza** - For custom streaming servers
- **Custom RTMP/HLS** - For self-hosted solutions

### Payment Processing

Currently integrated with Stripe for payment processing. The system supports:

- One-time payments for stream access
- Automatic refund processing
- Revenue analytics and reporting

### Analytics and Monitoring

The system tracks:

- Real-time viewer counts
- Stream quality metrics
- Chat engagement
- Geographic distribution
- Revenue metrics

## Security Considerations

1. **Access Control** - Pay-per-view streams require valid payment
2. **Chat Moderation** - Support for message moderation and deletion
3. **Rate Limiting** - WebSocket events are rate-limited
4. **Stream Keys** - Secure generation and management of stream keys

## Performance Optimization

1. **Database Indexing** - Optimized queries for analytics and chat
2. **WebSocket Scaling** - Designed for horizontal scaling
3. **Quality Adaptation** - Automatic quality adjustment based on network conditions
4. **Caching** - Stream metadata and analytics caching

## Monitoring and Alerts

The system provides metrics for:

- Stream health and quality
- Viewer engagement
- Payment success rates
- System performance

## Future Enhancements

1. **Multi-camera Support** - Support for multiple camera angles
2. **Interactive Features** - Polls, Q&A, virtual gifts
3. **Content Delivery Network** - Global CDN integration
4. **AI Moderation** - Automated chat and content moderation
5. **Mobile SDK** - Native mobile streaming support

## Troubleshooting

### Common Issues

1. **Stream Not Starting**
   - Check stream key configuration
   - Verify artist permissions
   - Ensure scheduled time is in the future

2. **Payment Failures**
   - Verify Stripe configuration
   - Check webhook endpoints
   - Review payment amount formatting

3. **Chat Not Working**
   - Confirm WebSocket connection
   - Check user authentication
   - Verify stream is live

4. **Quality Issues**
   - Review stream settings
   - Check network bandwidth
   - Verify encoding parameters

### Logs and Debugging

Enable debug logging by setting:

\`\`\`env
LOG_LEVEL=debug
\`\`\`

Key log locations:
- Stream creation and management
- Payment processing
- WebSocket connections
- Quality adaptation

## Support

For technical support or questions about the live streaming module, please refer to the main project documentation or contact the development team.
