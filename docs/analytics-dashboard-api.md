# Analytics Dashboard API Documentation

## Overview

The Analytics Dashboard provides comprehensive insights and performance tracking for artists on the platform. It includes streaming analytics, revenue tracking, demographic insights, and exportable reports.

## Features

- **Artist Dashboard**: Complete overview of artist performance
- **Streaming Analytics**: Track streams, listeners, and engagement
- **Revenue Analytics**: Monitor all revenue streams and projections
- **Demographic Insights**: Understand audience composition
- **Geographic Analysis**: Track global reach and market penetration
- **Comparative Analysis**: Compare multiple artists' performance
- **Export Functionality**: Generate reports in Excel, PDF, and CSV formats

## API Endpoints

### Dashboard Endpoints

#### Get Artist Dashboard
\`\`\`
GET /analytics/dashboard/artist/{artistId}
\`\`\`

**Query Parameters:**
- `timeRange`: `last_7_days` | `last_30_days` | `last_90_days` | `last_year` | `custom`
- `startDate`: ISO date string (required if timeRange is 'custom')
- `endDate`: ISO date string (required if timeRange is 'custom')
- `metrics`: Array of metrics to include
- `limit`: Number of results to return (default: 10)
- `offset`: Number of results to skip (default: 0)

**Response:**
\`\`\`json
{
  "artistId": "uuid",
  "artistName": "string",
  "timeRange": "string",
  "streamingMetrics": {
    "totalStreams": 1000000,
    "uniqueListeners": 50000  "string",
  "streamingMetrics": {
    "totalStreams": 1000000,
    "uniqueListeners": 50000,
    "averageStreamDuration": 180,
    "skipRate": 15,
    "completionRate": 85,
    "growthRate": 12.5
  },
  "revenueMetrics": {
    "totalRevenue": 25000.00,
    "streamingRevenue": 15000.00,
    "merchandiseRevenue": 7000.00,
    "eventRevenue": 3000.00,
    "projectedRevenue30Days": 8500.00,
    "growthRate": 8.2
  },
  "engagementMetrics": {
    "totalLikes": 75000,
    "totalShares": 12000,
    "totalComments": 8500,
    "playlistAdds": 25000,
    "followers": 150000,
    "newFollowers": 5000,
    "engagementRate": 4.2
  },
  "demographics": {
    "ageGroups": [
      { "ageGroup": "18-24", "percentage": 35.5 },
      { "ageGroup": "25-34", "percentage": 42.1 }
    ],
    "genderDistribution": [
      { "gender": "female", "percentage": 58.3 },
      { "gender": "male", "percentage": 41.7 }
    ],
    "topCountries": [
      { "country": "United States", "streams": 400000, "percentage": 40.0 },
      { "country": "United Kingdom", "streams": 200000, "percentage": 20.0 }
    ]
  },
  "topTracks": [
    {
      "trackId": "uuid",
      "title": "Hit Song",
      "streams": 500000,
      "revenue": 3000.00,
      "growthRate": 15.2
    }
  ],
  "chartData": {
    "streams": [
      { "date": "2024-01-01", "value": 10000 },
      { "date": "2024-01-02", "value": 12000 }
    ],
    "revenue": [
      { "date": "2024-01-01", "value": 150.00 },
      { "date": "2024-01-02", "value": 180.00 }
    ],
    "engagement": [
      { "date": "2024-01-01", "value": 500 },
      { "date": "2024-01-02", "value": 650 }
    ]
  }
}
\`\`\`

#### Compare Artists
\`\`\`
GET /analytics/dashboard/compare?artistIds=uuid1,uuid2,uuid3
\`\`\`

**Response:**
\`\`\`json
{
  "artists": [
    // Array of artist dashboard objects
  ],
  "comparison": {
    "topPerformer": {
      // Artist dashboard object of top performer
    },
    "averageMetrics": {
      "avgStreams": 750000,
      "avgRevenue": 18500.00,
      "avgEngagement": 3.8
    },
    "rankings": {
      "streamRanking": [
        { "artistId": "uuid", "rank": 1, "metric": "streams" }
      ],
      "revenueRanking": [
        { "artistId": "uuid", "rank": 1, "metric": "revenue" }
      ]
    }
  }
}
\`\`\`

### Streaming Analytics Endpoints

#### Get Streaming Trends
\`\`\`
GET /analytics/streaming/trends/{artistId}
\`\`\`

#### Get Demographic Insights
\`\`\`
GET /analytics/streaming/demographics/{artistId}
\`\`\`

#### Get Geographic Insights
\`\`\`
GET /analytics/streaming/geographic/{artistId}
\`\`\`

#### Get Performance Metrics
\`\`\`
GET /analytics/streaming/performance/{artistId}
\`\`\`

### Export Endpoints

#### Export to Excel
\`\`\`
GET /analytics/dashboard/export/excel/{artistId}
\`\`\`

#### Export to PDF
\`\`\`
GET /analytics/dashboard/export/pdf/{artistId}
\`\`\`

#### Export to CSV
\`\`\`
GET /analytics/dashboard/export/csv/{artistId}
\`\`\`

## Data Models

### Analytics Entities

The system uses three main analytics entities:

1. **ArtistAnalytics**: Daily aggregated data for artists
2. **TrackAnalytics**: Daily aggregated data for individual tracks
3. **RevenueAnalytics**: Daily revenue data with projections

### Key Metrics

- **Streaming Metrics**: Total streams, unique listeners, skip rate, completion rate
- **Revenue Metrics**: Streaming, merchandise, event, and licensing revenue
- **Engagement Metrics**: Likes, shares, comments, playlist adds, followers
- **Demographic Data**: Age groups, gender distribution, geographic data

## Usage Examples

### Get Artist Dashboard for Last 30 Days
\`\`\`bash
curl -X GET "https://api.example.com/analytics/dashboard/artist/123e4567-e89b-12d3-a456-426614174000?timeRange=last_30_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

### Export Analytics Report
\`\`\`bash
curl -X GET "https://api.example.com/analytics/dashboard/export/excel/123e4567-e89b-12d3-a456-426614174000?timeRange=last_90_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o "analytics-report.xlsx"
\`\`\`

### Compare Multiple Artists
\`\`\`bash
curl -X GET "https://api.example.com/analytics/dashboard/compare?artistIds=uuid1,uuid2,uuid3&timeRange=last_30_days" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

## Implementation Notes

### Database Optimization

- Indexes are created on `(artistId, date)` for efficient querying
- JSONB columns store flexible demographic and geographic data
- Partitioning by date can be implemented for large datasets

### Performance Considerations

- Analytics data is aggregated daily to improve query performance
- Caching can be implemented for frequently accessed dashboard data
- Background jobs should handle data aggregation and projection calculations

### Security

- All endpoints require JWT authentication
- Artists can only access their own analytics data
- Admin users can access comparative analytics across artists

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (artist not found)
- `500`: Internal Server Error

## Rate Limiting

- Dashboard endpoints: 100 requests per minute
- Export endpoints: 10 requests per minute
- Streaming analytics: 200 requests per minute

## Future Enhancements

- Real-time analytics updates
- Machine learning-based trend predictions
- Advanced segmentation and cohort analysis
- Integration with external analytics platforms
- Custom dashboard widgets and layouts
