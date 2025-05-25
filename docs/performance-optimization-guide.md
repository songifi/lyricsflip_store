# Music Streaming Performance Optimization Guide

## Overview

This guide covers the comprehensive performance optimization implementation for the NestJS music streaming platform, including database optimization, caching strategies, CDN integration, and monitoring.

## Database Optimization

### 1. Connection Pooling

The database configuration includes optimized connection pooling:

- **Max Connections**: 20 (configurable via `DB_POOL_MAX`)
- **Min Connections**: 5 (configurable via `DB_POOL_MIN`)
- **Acquire Timeout**: 30 seconds
- **Idle Timeout**: 10 seconds
- **Evict Timeout**: 60 seconds

### 2. Database Indexes

Critical indexes have been created for optimal query performance:

#### Primary Indexes
- `idx_tracks_play_count_desc`: For popular tracks queries
- `idx_tracks_created_at_desc`: For recent tracks
- `idx_tracks_artist_id`, `idx_tracks_album_id`: For relationship queries

#### Full-Text Search Indexes
- `idx_tracks_title_fts`: Full-text search on track titles
- `idx_artists_name_fts`: Full-text search on artist names
- `idx_albums_title_fts`: Full-text search on album titles

#### Composite Indexes
- `idx_tracks_artist_play_count`: Optimized artist track queries
- `idx_tracks_genre_play_count`: Genre-based popular tracks

### 3. Materialized Views

A materialized view `popular_tracks_mv` is created for frequently accessed popular tracks data, refreshed every 15 minutes.

## Caching Strategy

### 1. Redis Configuration

Multi-level caching with Redis:
- **Query Result Cache**: TypeORM query results
- **Application Cache**: Frequently accessed data
- **Session Cache**: User sessions and streaming data

### 2. Cache Keys Structure

\`\`\`
track:{trackId}                    # Individual track data
album:{albumId}                    # Album data
playlist:{playlistId}              # Playlist data
search:{base64Query}               # Search results
popular-tracks:{limit}             # Popular tracks
recommendations:{userId}:{limit}   # User recommendations
streaming:session:{sessionId}      # Streaming sessions
\`\`\`

### 3. Cache TTL Strategy

- **Track Data**: 1 hour (3600s)
- **Search Results**: 10 minutes (600s)
- **Popular Tracks**: 30 minutes (1800s)
- **User Recommendations**: 30 minutes (1800s)
- **Streaming Sessions**: 1 hour (3600s)

## CDN Integration

### 1. AWS S3 + CloudFront

- **Storage**: AWS S3 for audio file storage
- **Distribution**: CloudFront for global content delivery
- **Caching**: 1-year cache headers for audio files
- **Signed URLs**: Secure streaming with time-limited access

### 2. Streaming Optimization

- **Quality Adaptation**: Automatic quality adjustment based on user tier and network conditions
- **Format Selection**: MP3, AAC, FLAC support
- **Bitrate Optimization**: Dynamic bitrate selection

### 3. CDN Cache Management

- **Invalidation**: Programmatic cache invalidation for updated content
- **Metrics**: CloudWatch integration for streaming analytics

## Query Optimization

### 1. Optimized Queries

The `OptimizedMusicService` implements several optimization strategies:

#### Popular Tracks Query
\`\`\`sql
SELECT track.*, artist.name, album.title 
FROM tracks track
LEFT JOIN artists artist ON track.artist_id = artist.id
LEFT JOIN albums album ON track.album_id = album.id
ORDER BY track.play_count DESC, track.created_at DESC
LIMIT ?
\`\`\`

#### Full-Text Search Query
\`\`\`sql
SELECT track.* FROM tracks track
WHERE to_tsvector('english', track.title) @@ plainto_tsquery('english', ?)
   OR to_tsvector('english', artist.name) @@ plainto_tsquery('english', ?)
   OR to_tsvector('english', album.title) @@ plainto_tsquery('english', ?)
\`\`\`

### 2. Query Performance Features

- **TypeORM Query Cache**: Enabled for frequently accessed queries
- **Pagination**: Efficient offset-based pagination
- **Selective Loading**: Only load required fields and relationships
- **Batch Operations**: Bulk operations for better performance

## Performance Monitoring

### 1. Metrics Collection

The `PerformanceMonitoringService` tracks:

- **Response Times**: API endpoint performance
- **Memory Usage**: Application memory consumption
- **Database Metrics**: Connection pool status, slow queries
- **Cache Performance**: Hit rates, miss rates
- **Streaming Metrics**: Bandwidth, buffer events, errors

### 2. Performance Alerts

Automated alerts for:
- **High Response Time**: > 5 seconds (configurable)
- **High Memory Usage**: > 512MB (configurable)
- **Low Cache Hit Rate**: < 80% (configurable)
- **Database Connection Issues**: Pool exhaustion
- **Streaming Errors**: High error rates

### 3. Monitoring Dashboard

Key metrics available:
- Real-time active streaming sessions
- Average response times by endpoint
- Database connection pool status
- Cache hit/miss ratios
- Memory and CPU usage trends

## Streaming Performance

### 1. Session Management

- **Session Tracking**: Individual streaming session monitoring
- **Quality Optimization**: Dynamic quality adjustment
- **Error Handling**: Comprehensive error tracking and recovery
- **Bandwidth Monitoring**: Real-time bandwidth usage tracking

### 2. Performance Metrics

- **Buffer Events**: Track buffering occurrences
- **Error Rates**: Monitor streaming failures
- **Concurrent Streams**: Track simultaneous streaming sessions
- **Quality Distribution**: Monitor popular streaming qualities

### 3. Optimization Features

- **Adaptive Streaming**: Quality adjustment based on network conditions
- **Preloading**: Intelligent content preloading
- **CDN Edge Caching**: Global content distribution
- **Connection Pooling**: Efficient connection management

## Implementation Checklist

### Database Setup
- [ ] Run database migrations with indexes
- [ ] Enable pg_stat_statements extension
- [ ] Configure connection pooling
- [ ] Set up materialized view refresh schedule

### Cache Setup
- [ ] Install and configure Redis
- [ ] Set up cache invalidation strategies
- [ ] Configure cache TTL values
- [ ] Test cache performance

### CDN Setup
- [ ] Configure AWS S3 bucket
- [ ] Set up CloudFront distribution
- [ ] Configure signed URL generation
- [ ] Test streaming URLs

### Monitoring Setup
- [ ] Configure performance alerts
- [ ] Set up monitoring dashboard
- [ ] Test alert notifications
- [ ] Configure log aggregation

### Performance Testing
- [ ] Load test API endpoints
- [ ] Test streaming performance
- [ ] Validate cache effectiveness
- [ ] Monitor database performance

## Environment Variables

Ensure all required environment variables are set:

\`\`\`bash
# Database
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
DB_POOL_MAX, DB_POOL_MIN, DB_POOL_ACQUIRE_TIMEOUT

# Redis
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB

# AWS
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
AWS_S3_BUCKET, CDN_DOMAIN, CLOUDFRONT_DISTRIBUTION_ID

# Monitoring
ALERT_RESPONSE_TIME_MS, ALERT_MEMORY_USAGE_MB, ALERT_CACHE_HIT_RATE
\`\`\`

## Best Practices

1. **Database**: Use EXPLAIN ANALYZE to monitor query performance
2. **Caching**: Implement cache warming for critical data
3. **CDN**: Use appropriate cache headers and invalidation strategies
4. **Monitoring**: Set up comprehensive alerting and logging
5. **Testing**: Regular performance testing and optimization
6. **Scaling**: Plan for horizontal scaling with load balancers

## Troubleshooting

### Common Issues

1. **Slow Queries**: Check missing indexes, analyze query plans
2. **Cache Misses**: Verify cache keys and TTL settings
3. **CDN Issues**: Check CloudFront configuration and invalidation
4. **Memory Leaks**: Monitor memory usage and connection pools
5. **Streaming Errors**: Check CDN connectivity and signed URL generation

### Performance Tuning

1. **Database**: Adjust connection pool sizes based on load
2. **Cache**: Optimize TTL values based on data access patterns
3. **CDN**: Configure appropriate cache headers and edge locations
4. **Application**: Use connection pooling and async operations
5. **Monitoring**: Fine-tune alert thresholds based on baseline metrics
