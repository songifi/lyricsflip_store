import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ArtistAnalytics } from "../entities/artist-analytics.entity"
import { TrackAnalytics } from "../entities/track-analytics.entity"
import { RevenueAnalytics } from "../entities/revenue-analytics.entity"
import { type AnalyticsQueryDto, AnalyticsTimeRange } from "../dto/analytics-query.dto"

@Injectable()
export class AnalyticsDataService {
  private artistAnalyticsRepository: Repository<ArtistAnalytics>
  private trackAnalyticsRepository: Repository<TrackAnalytics>
  private revenueAnalyticsRepository: Repository<RevenueAnalytics>

  constructor(
    @InjectRepository(ArtistAnalytics)
    artistAnalyticsRepository: Repository<ArtistAnalytics>,
    @InjectRepository(TrackAnalytics)
    trackAnalyticsRepository: Repository<TrackAnalytics>,
    @InjectRepository(RevenueAnalytics)
    revenueAnalyticsRepository: Repository<RevenueAnalytics>,
  ) {
    this.artistAnalyticsRepository = artistAnalyticsRepository
    this.trackAnalyticsRepository = trackAnalyticsRepository
    this.revenueAnalyticsRepository = revenueAnalyticsRepository
  }

  private getDateRange(timeRange: AnalyticsTimeRange, startDate?: string, endDate?: string) {
    const now = new Date()
    let start: Date
    let end: Date = now

    switch (timeRange) {
      case AnalyticsTimeRange.LAST_7_DAYS:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case AnalyticsTimeRange.LAST_30_DAYS:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case AnalyticsTimeRange.LAST_90_DAYS:
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case AnalyticsTimeRange.LAST_YEAR:
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case AnalyticsTimeRange.CUSTOM:
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = endDate ? new Date(endDate) : now
        break
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return { start, end }
  }

  async getArtistStreamingMetrics(artistId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query.timeRange, query.startDate, query.endDate)

    const result = await this.artistAnalyticsRepository
      .createQueryBuilder("analytics")
      .select([
        "SUM(analytics.totalStreams) as totalStreams",
        "SUM(analytics.uniqueListeners) as uniqueListeners",
        "AVG(analytics.skipRate) as avgSkipRate",
        "AVG(analytics.completionRate) as avgCompletionRate",
      ])
      .where("analytics.artistId = :artistId", { artistId })
      .andWhere("analytics.date BETWEEN :start AND :end", { start, end })
      .getRawOne()

    // Calculate growth rate by comparing with previous period
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()))
    const previousResult = await this.artistAnalyticsRepository
      .createQueryBuilder("analytics")
      .select("SUM(analytics.totalStreams) as totalStreams")
      .where("analytics.artistId = :artistId", { artistId })
      .andWhere("analytics.date BETWEEN :start AND :end", {
        start: previousPeriodStart,
        end: start,
      })
      .getRawOne()

    const growthRate =
      previousResult.totalStreams > 0
        ? ((result.totalStreams - previousResult.totalStreams) / previousResult.totalStreams) * 100
        : 0

    return {
      totalStreams: Number.parseInt(result.totalStreams) || 0,
      uniqueListeners: Number.parseInt(result.uniqueListeners) || 0,
      averageStreamDuration: 0, // Calculate from track analytics
      skipRate: Number.parseFloat(result.avgSkipRate) || 0,
      completionRate: Number.parseFloat(result.avgCompletionRate) || 0,
      growthRate: Number.parseFloat(growthRate.toFixed(2)),
    }
  }

  async getArtistRevenueMetrics(artistId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query.timeRange, query.startDate, query.endDate)

    const result = await this.revenueAnalyticsRepository
      .createQueryBuilder("revenue")
      .select([
        "SUM(revenue.totalRevenue) as totalRevenue",
        "SUM(revenue.streamingRevenue) as streamingRevenue",
        "SUM(revenue.merchandiseRevenue) as merchandiseRevenue",
        "SUM(revenue.eventRevenue) as eventRevenue",
        "AVG(revenue.projectedRevenue30Days) as projectedRevenue30Days",
        "AVG(revenue.growthRate) as growthRate",
      ])
      .where("revenue.artistId = :artistId", { artistId })
      .andWhere("revenue.date BETWEEN :start AND :end", { start, end })
      .getRawOne()

    return {
      totalRevenue: Number.parseFloat(result.totalRevenue) || 0,
      streamingRevenue: Number.parseFloat(result.streamingRevenue) || 0,
      merchandiseRevenue: Number.parseFloat(result.merchandiseRevenue) || 0,
      eventRevenue: Number.parseFloat(result.eventRevenue) || 0,
      projectedRevenue30Days: Number.parseFloat(result.projectedRevenue30Days) || 0,
      growthRate: Number.parseFloat(result.growthRate) || 0,
    }
  }

  async getArtistEngagementMetrics(artistId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query.timeRange, query.startDate, query.endDate)

    const result = await this.artistAnalyticsRepository
      .createQueryBuilder("analytics")
      .select([
        "SUM(analytics.likes) as totalLikes",
        "SUM(analytics.shares) as totalShares",
        "SUM(analytics.comments) as totalComments",
        "SUM(analytics.playlistAdds) as playlistAdds",
        "MAX(analytics.followers) as followers",
        "SUM(analytics.newFollowers) as newFollowers",
      ])
      .where("analytics.artistId = :artistId", { artistId })
      .andWhere("analytics.date BETWEEN :start AND :end", { start, end })
      .getRawOne()

    const totalEngagements =
      (Number.parseInt(result.totalLikes) || 0) +
      (Number.parseInt(result.totalShares) || 0) +
      (Number.parseInt(result.totalComments) || 0)

    const engagementRate = result.followers > 0 ? (totalEngagements / result.followers) * 100 : 0

    return {
      totalLikes: Number.parseInt(result.totalLikes) || 0,
      totalShares: Number.parseInt(result.totalShares) || 0,
      totalComments: Number.parseInt(result.totalComments) || 0,
      playlistAdds: Number.parseInt(result.playlistAdds) || 0,
      followers: Number.parseInt(result.followers) || 0,
      newFollowers: Number.parseInt(result.newFollowers) || 0,
      engagementRate: Number.parseFloat(engagementRate.toFixed(2)),
    }
  }

  async getArtistDemographics(artistId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query.timeRange, query.startDate, query.endDate)

    const analytics = await this.artistAnalyticsRepository
      .createQueryBuilder("analytics")
      .select(["analytics.demographicData", "analytics.geographicData"])
      .where("analytics.artistId = :artistId", { artistId })
      .andWhere("analytics.date BETWEEN :start AND :end", { start, end })
      .getMany()

    // Aggregate demographic data
    const ageGroups = new Map()
    const genderDistribution = new Map()
    const countries = new Map()

    analytics.forEach((record) => {
      if (record.demographicData) {
        record.demographicData.forEach((demo) => {
          const ageKey = demo.ageGroup
          const genderKey = demo.gender

          ageGroups.set(ageKey, (ageGroups.get(ageKey) || 0) + demo.percentage)
          genderDistribution.set(genderKey, (genderDistribution.get(genderKey) || 0) + demo.percentage)
        })
      }

      if (record.geographicData) {
        record.geographicData.forEach((geo) => {
          const existing = countries.get(geo.country) || { streams: 0, revenue: 0 }
          countries.set(geo.country, {
            streams: existing.streams + geo.streams,
            revenue: existing.revenue + geo.revenue,
          })
        })
      }
    })

    const totalStreams = Array.from(countries.values()).reduce((sum, country) => sum + country.streams, 0)

    return {
      ageGroups: Array.from(ageGroups.entries()).map(([ageGroup, percentage]) => ({
        ageGroup,
        percentage: Number.parseFloat((percentage / analytics.length).toFixed(2)),
      })),
      genderDistribution: Array.from(genderDistribution.entries()).map(([gender, percentage]) => ({
        gender,
        percentage: Number.parseFloat((percentage / analytics.length).toFixed(2)),
      })),
      topCountries: Array.from(countries.entries())
        .map(([country, data]) => ({
          country,
          streams: data.streams,
          percentage: totalStreams > 0 ? Number.parseFloat(((data.streams / totalStreams) * 100).toFixed(2)) : 0,
        }))
        .sort((a, b) => b.streams - a.streams)
        .slice(0, 10),
    }
  }

  async getTopTracks(artistId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query.timeRange, query.startDate, query.endDate)

    const tracks = await this.trackAnalyticsRepository
      .createQueryBuilder("track_analytics")
      .leftJoinAndSelect("track_analytics.track", "track")
      .select([
        "track_analytics.trackId",
        "track.title",
        "SUM(track_analytics.streams) as totalStreams",
        "SUM(track_analytics.revenue) as totalRevenue",
      ])
      .where("track_analytics.artistId = :artistId", { artistId })
      .andWhere("track_analytics.date BETWEEN :start AND :end", { start, end })
      .groupBy("track_analytics.trackId, track.title")
      .orderBy("totalStreams", "DESC")
      .limit(query.limit || 10)
      .getRawMany()

    return tracks.map((track) => ({
      trackId: track.trackId,
      title: track.title,
      streams: Number.parseInt(track.totalStreams) || 0,
      revenue: Number.parseFloat(track.totalRevenue) || 0,
      growthRate: 0, // Calculate growth rate if needed
    }))
  }

  async getChartData(artistId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query.timeRange, query.startDate, query.endDate)

    const analytics = await this.artistAnalyticsRepository
      .createQueryBuilder("analytics")
      .select(["analytics.date", "analytics.totalStreams", "analytics.likes", "analytics.shares", "analytics.comments"])
      .leftJoin(
        "revenue_analytics",
        "revenue",
        "revenue.artistId = analytics.artistId AND revenue.date = analytics.date",
      )
      .addSelect("revenue.totalRevenue")
      .where("analytics.artistId = :artistId", { artistId })
      .andWhere("analytics.date BETWEEN :start AND :end", { start, end })
      .orderBy("analytics.date", "ASC")
      .getRawMany()

    return {
      streams: analytics.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        value: Number.parseInt(item.totalStreams) || 0,
      })),
      revenue: analytics.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        value: Number.parseFloat(item.totalRevenue) || 0,
      })),
      engagement: analytics.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        value:
          (Number.parseInt(item.likes) || 0) +
          (Number.parseInt(item.shares) || 0) +
          (Number.parseInt(item.comments) || 0),
      })),
    }
  }
}
