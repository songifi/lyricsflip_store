import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { AnalyticsDataService } from "../services/analytics-data.service"
import type { AnalyticsQueryDto } from "../dto/analytics-query.dto"

@ApiTags("Analytics Streaming")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics/streaming")
export class AnalyticsStreamingController {
  constructor(private readonly analyticsDataService: AnalyticsDataService) {}

  @Get("trends/:artistId")
  @ApiOperation({ summary: "Get streaming trends for artist" })
  @ApiResponse({ status: 200, description: "Streaming trends data" })
  async getStreamingTrends(@Param('artistId') artistId: string, @Query() query: AnalyticsQueryDto) {
    const [metrics, chartData] = await Promise.all([
      this.analyticsDataService.getArtistStreamingMetrics(artistId, query),
      this.analyticsDataService.getChartData(artistId, query),
    ])

    return {
      metrics,
      trends: chartData.streams,
      insights: this.generateStreamingInsights(metrics, chartData.streams),
    }
  }

  @Get("demographics/:artistId")
  @ApiOperation({ summary: "Get demographic insights for artist" })
  @ApiResponse({ status: 200, description: "Demographic data" })
  async getDemographicInsights(@Param('artistId') artistId: string, @Query() query: AnalyticsQueryDto) {
    const demographics = await this.analyticsDataService.getArtistDemographics(artistId, query)

    return {
      demographics,
      insights: this.generateDemographicInsights(demographics),
    }
  }

  @Get("geographic/:artistId")
  @ApiOperation({ summary: "Get geographic distribution for artist" })
  @ApiResponse({ status: 200, description: "Geographic data" })
  async getGeographicInsights(@Param('artistId') artistId: string, @Query() query: AnalyticsQueryDto) {
    const demographics = await this.analyticsDataService.getArtistDemographics(artistId, query)

    return {
      geographic: demographics.topCountries,
      insights: this.generateGeographicInsights(demographics.topCountries),
    }
  }

  @Get("performance/:artistId")
  @ApiOperation({ summary: "Get performance metrics for artist" })
  @ApiResponse({ status: 200, description: "Performance metrics" })
  async getPerformanceMetrics(@Param('artistId') artistId: string, @Query() query: AnalyticsQueryDto) {
    const [streamingMetrics, topTracks] = await Promise.all([
      this.analyticsDataService.getArtistStreamingMetrics(artistId, query),
      this.analyticsDataService.getTopTracks(artistId, query),
    ])

    return {
      streamingMetrics,
      topTracks,
      insights: this.generatePerformanceInsights(streamingMetrics, topTracks),
    }
  }

  private generateStreamingInsights(metrics: any, trends: any[]) {
    const insights = []

    if (metrics.growthRate > 10) {
      insights.push({
        type: "positive",
        message: `Strong growth with ${metrics.growthRate}% increase in streams`,
      })
    } else if (metrics.growthRate < -5) {
      insights.push({
        type: "warning",
        message: `Declining streams with ${Math.abs(metrics.growthRate)}% decrease`,
      })
    }

    if (metrics.skipRate > 30) {
      insights.push({
        type: "warning",
        message: `High skip rate of ${metrics.skipRate}% suggests content optimization needed`,
      })
    }

    if (metrics.completionRate > 80) {
      insights.push({
        type: "positive",
        message: `Excellent completion rate of ${metrics.completionRate}%`,
      })
    }

    return insights
  }

  private generateDemographicInsights(demographics: any) {
    const insights = []

    const dominantAge = demographics.ageGroups.reduce((prev, current) =>
      prev.percentage > current.percentage ? prev : current,
    )

    insights.push({
      type: "info",
      message: `Primary audience is ${dominantAge.ageGroup} (${dominantAge.percentage}%)`,
    })

    const genderBalance = demographics.genderDistribution.find((g) => g.gender === "female")?.percentage || 0
    if (genderBalance > 60) {
      insights.push({
        type: "info",
        message: `Strong female audience (${genderBalance}%)`,
      })
    } else if (genderBalance < 40) {
      insights.push({
        type: "info",
        message: `Strong male audience (${100 - genderBalance}%)`,
      })
    }

    return insights
  }

  private generateGeographicInsights(countries: any[]) {
    const insights = []

    if (countries.length > 0) {
      const topCountry = countries[0]
      insights.push({
        type: "info",
        message: `${topCountry.country} is your top market with ${topCountry.percentage}% of streams`,
      })

      const internationalPercentage = countries.slice(1).reduce((sum, country) => sum + country.percentage, 0)
      if (internationalPercentage > 50) {
        insights.push({
          type: "positive",
          message: `Strong international presence with ${internationalPercentage}% of streams from global markets`,
        })
      }
    }

    return insights
  }

  private generatePerformanceInsights(metrics: any, topTracks: any[]) {
    const insights = []

    if (topTracks.length > 0) {
      const topTrack = topTracks[0]
      const totalStreams = topTracks.reduce((sum, track) => sum + track.streams, 0)
      const topTrackPercentage = (topTrack.streams / totalStreams) * 100

      if (topTrackPercentage > 50) {
        insights.push({
          type: "warning",
          message: `Heavy reliance on "${topTrack.title}" (${topTrackPercentage.toFixed(1)}% of streams)`,
        })
      }
    }

    if (metrics.uniqueListeners > 0) {
      const streamsPerListener = metrics.totalStreams / metrics.uniqueListeners
      if (streamsPerListener > 3) {
        insights.push({
          type: "positive",
          message: `High listener loyalty with ${streamsPerListener.toFixed(1)} streams per listener`,
        })
      }
    }

    return insights
  }
}
