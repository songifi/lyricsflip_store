import { ApiProperty } from "@nestjs/swagger"

export class StreamingMetricsDto {
  @ApiProperty()
  totalStreams: number

  @ApiProperty()
  uniqueListeners: number

  @ApiProperty()
  averageStreamDuration: number

  @ApiProperty()
  skipRate: number

  @ApiProperty()
  completionRate: number

  @ApiProperty()
  growthRate: number
}

export class RevenueMetricsDto {
  @ApiProperty()
  totalRevenue: number

  @ApiProperty()
  streamingRevenue: number

  @ApiProperty()
  merchandiseRevenue: number

  @ApiProperty()
  eventRevenue: number

  @ApiProperty()
  projectedRevenue30Days: number

  @ApiProperty()
  growthRate: number
}

export class EngagementMetricsDto {
  @ApiProperty()
  totalLikes: number

  @ApiProperty()
  totalShares: number

  @ApiProperty()
  totalComments: number

  @ApiProperty()
  playlistAdds: number

  @ApiProperty()
  followers: number

  @ApiProperty()
  newFollowers: number

  @ApiProperty()
  engagementRate: number
}

export class DemographicDataDto {
  @ApiProperty()
  ageGroups: {
    ageGroup: string
    percentage: number
  }[]

  @ApiProperty()
  genderDistribution: {
    gender: string
    percentage: number
  }[]

  @ApiProperty()
  topCountries: {
    country: string
    streams: number
    percentage: number
  }[]
}

export class TopTrackDto {
  @ApiProperty()
  trackId: string

  @ApiProperty()
  title: string

  @ApiProperty()
  streams: number

  @ApiProperty()
  revenue: number

  @ApiProperty()
  growthRate: number
}

export class ArtistDashboardDto {
  @ApiProperty()
  artistId: string

  @ApiProperty()
  artistName: string

  @ApiProperty()
  timeRange: string

  @ApiProperty({ type: StreamingMetricsDto })
  streamingMetrics: StreamingMetricsDto

  @ApiProperty({ type: RevenueMetricsDto })
  revenueMetrics: RevenueMetricsDto

  @ApiProperty({ type: EngagementMetricsDto })
  engagementMetrics: EngagementMetricsDto

  @ApiProperty({ type: DemographicDataDto })
  demographics: DemographicDataDto

  @ApiProperty({ type: [TopTrackDto] })
  topTracks: TopTrackDto[]

  @ApiProperty()
  chartData: {
    streams: { date: string; value: number }[]
    revenue: { date: string; value: number }[]
    engagement: { date: string; value: number }[]
  }
}
