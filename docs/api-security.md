# API Security Documentation

## Overview

This document outlines the security measures implemented in the Music Platform API, including rate limiting, API key management, content protection, and abuse detection.

## Rate Limiting

### Configuration

Rate limits are applied per endpoint type:

- **Streaming**: 100 requests per minute
- **Upload**: 10 uploads per 5 minutes  
- **Search**: 200 searches per minute
- **Authentication**: 5 attempts per 15 minutes
- **General**: 1000 requests per minute
- **Developer API**: 10,000 requests per hour

### Usage

Apply rate limiting to controllers using the `@RateLimit()` decorator:

\`\`\`typescript
@RateLimit(RateLimitConfigs.STREAMING)
@Get('stream/:trackId')
async streamTrack(@Param('trackId') trackId: string) {
  // Implementation
}
\`\`\`

### Headers

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## API Key Management

### Creating API Keys

API keys are created through the `/security/api-keys` endpoint:

\`\`\`typescript
POST /security/api-keys
{
  "name": "My App",
  "description": "API key for my music app",
  "scopes": ["read", "stream"],
  "rateLimits": {
    "windowMs": 3600000,
    "max": 5000
  },
  "expiresAt": "2024-12-31T23:59:59Z"
}
\`\`\`

### API Key Format

API keys follow the format: `mk_[64-character-hex-string]`

### Scopes

Available scopes:
- `read`: Read access to public data
- `write`: Write access to user data
- `stream`: Audio streaming access
- `upload`: File upload access
- `admin`: Administrative access

### Authentication

Include API keys in requests using one of these methods:

1. **Authorization Header** (Recommended):
   \`\`\`
   Authorization: Bearer mk_your_api_key_here
   \`\`\`

2. **Custom Header**:
   \`\`\`
   X-API-Key: mk_your_api_key_here
   \`\`\`

3. **Query Parameter**:
   \`\`\`
   GET /api/tracks?api_key=mk_your_api_key_here
   \`\`\`

## Content Protection (DRM)

### Streaming Tokens

Protected content requires streaming tokens:

\`\`\`typescript
// Get streaming token
GET /streaming/token/:trackId
// Returns: { token: "jwt_token", expiresIn: 3600 }

// Stream audio with token
GET /streaming/audio/:trackId?token=jwt_token&chunk=0
\`\`\`

### Features

- **Encryption**: Audio chunks are encrypted with AES-256-CBC
- **Watermarking**: Each stream includes a unique watermark
- **Token Expiration**: Streaming tokens expire after 1 hour
- **Access Control**: Validates user permissions before streaming

## Abuse Detection

### Patterns Monitored

1. **Rapid Streaming**: >100 streams per minute
2. **Download Abuse**: >50 downloads per hour
3. **API Scraping**: >1000 API calls per minute
4. **Bot Activity**: Suspicious user agents

### Responses

- **Low Severity**: Monitor and log
- **Medium Severity**: Apply throttling
- **High Severity**: Block requests

### Bot Detection

Requests are flagged as suspicious if they contain user agents matching:
- `bot`, `crawler`, `spider`, `scraper`
- `curl`, `wget`, `python`, `requests`

## Security Headers

The following security headers are automatically applied:

\`\`\`
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
\`\`\`

## CORS Configuration

CORS is configured to allow:
- Specific origins (configure in environment)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Required headers (Authorization, Content-Type, X-API-Key)

## Monitoring and Alerting

### Metrics Available

- Total requests
- Blocked requests  
- Rate limit violations
- Abuse incidents
- Top abusive IPs
- Most accessed endpoints

### Alerts

Automatic alerts are triggered for:
- High abuse detection
- Repeated violations from same IP
- Unusual traffic patterns

### Endpoints

\`\`\`typescript
// Get security metrics
GET /security/metrics?range=24h

// Get recent alerts  
GET /security/alerts?limit=50
\`\`\`

## Environment Variables

Required environment variables:

\`\`\`env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=music_platform

# Redis
REDIS_URL=redis://localhost:6379

# DRM
DRM_ENCRYPTION_KEY=your_32_byte_encryption_key
DRM_TOKEN_SECRET=your_jwt_secret

# Security
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
\`\`\`

## Best Practices

1. **Rotate API Keys**: Regularly rotate API keys
2. **Monitor Usage**: Track API usage patterns
3. **Implement Logging**: Log all security events
4. **Use HTTPS**: Always use HTTPS in production
5. **Validate Input**: Validate all user input
6. **Rate Limit**: Apply appropriate rate limits
7. **Monitor Alerts**: Respond to security alerts promptly

## Error Responses

### Rate Limit Exceeded (429)
\`\`\`json
{
  "statusCode": 429,
  "message": "Too many requests",
  "retryAfter": 60
}
\`\`\`

### Invalid API Key (401)
\`\`\`json
{
  "statusCode": 401,
  "message": "Invalid API key"
}
\`\`\`

### Insufficient Permissions (403)
\`\`\`json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
\`\`\`

### Abuse Detected (429)
\`\`\`json
{
  "statusCode": 429,
  "message": "Streaming abuse detected. Please try again later."
}
