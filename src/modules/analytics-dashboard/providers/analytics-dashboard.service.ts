import { Injectable } from "@nestjs/common"
import type { AnalyticsDataService } from "./analytics-data.service"
import type { AnalyticsQueryDto } from "../dto/analytics-query.dto"
import type { ArtistDashboardDto } from "../dto/dashboard-response.dto"

@Injectable()
export class AnalyticsDashboardService {
  constructor(private readonly analyticsDataService: AnalyticsDataService) {}

  async getArtistDashboard(artistId: string, query: AnalyticsQueryDto): Promise<ArtistDashboardDto> {
    const [streamingMetrics, revenueMetrics, engagementMetrics, demographics, topTracks, chartData] = await Promise.all(
      [
        this.analyticsDataService.getArtistStreamingMetrics(artistId, query),
        this.analyticsDataService.getArtistRevenueMetrics(artistId, query),
        this.analyticsDataService.getArtistEngagementMetrics(artistId, query),
        this.analyticsDataService.getArtistDemographics(artistId, query),
        this.analyticsDataService.getTopTracks(artistId, query),
        this.analyticsDataService.getChartData(artistId, query),
      ],
    )

    return {
      artistId,
      artistName: "", // Fetch from artist service
      timeRange: query.timeRange,
      streamingMetrics,
      revenueMetrics,
      engagementMetrics,
      demographics,
      topTracks,
      chartData,
    }
  }

  async getComparativeAnalysis(artistIds: string[], query: AnalyticsQueryDto) {
    const dashboards = await Promise.all(artistIds.map((artistId) => this.getArtistDashboard(artistId, query)))

    return {
      artists: dashboards,
      comparison: {
        topPerformer: this.getTopPerformer(dashboards),
        averageMetrics: this.calculateAverageMetrics(dashboards),
        rankings: this.calculateRankings(dashboards),
      },
    }
  }

  private getTopPerformer(dashboards: ArtistDashboardDto[]) {
    return dashboards.reduce((top, current) =>
      current.streamingMetrics.totalStreams > top.streamingMetrics.totalStreams ? current : top,
    )
  }

  private calculateAverageMetrics(dashboards: ArtistDashboardDto[]) {
    const count = dashboards.length
    if (count === 0) return null

    return {
      avgStreams: dashboards.reduce((sum, d) => sum + d.streamingMetrics.totalStreams, 0) / count,
      avgRevenue: dashboards.reduce((sum, d) => sum + d.revenueMetrics.totalRevenue, 0) / count,
      avgEngagement: dashboards.reduce((sum, d) => sum + d.engagementMetrics.engagementRate, 0) / count,
    }
  }

  private calculateRankings(dashboards: ArtistDashboardDto[]) {
    const streamRanking = [...dashboards]
      .sort((a, b) => b.streamingMetrics.totalStreams - a.streamingMetrics.totalStreams)
      .map((artist, index) => ({ artistId: artist.artistId, rank: index + 1, metric: "streams" }))

    const revenueRanking = [...dashboards]
      .sort((a, b) => b.revenueMetrics.totalRevenue - a.revenueMetrics.totalRevenue)
      .map((artist, index) => ({ artistId: artist.artistId, rank: index + 1, metric: "revenue" }))

    return { streamRanking, revenueRanking }
  }
}
