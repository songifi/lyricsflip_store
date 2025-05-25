import { Injectable } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { type PodcastAnalytics, AnalyticsEventType } from "../../../database/entities/podcast-analytics.entity"

export interface AnalyticsData {
  totalPlays: number
  totalDownloads: number
  totalShares: number
  averageListenTime: number
  completionRate: number
  topCountries: Array<{ country: string; count: number }>
  topDevices: Array<{ device: string; count: number }>
  dailyStats: Array<{ date: string; plays: number; downloads: number }>
}

@Injectable()
export class PodcastAnalyticsService {
  constructor(private analyticsRepository: Repository<PodcastAnalytics>) {}

  async trackEvent(
    eventType: AnalyticsEventType,
    podcastId: string,
    episodeId: string,
    userId?: string,
    metadata?: {
      timestamp?: number
      duration?: number
      ipAddress?: string
      userAgent?: string
      country?: string
      city?: string
      device?: string
      platform?: string
    },
  ): Promise<void> {
    const analytics = this.analyticsRepository.create({
      eventType,
      podcastId,
      episodeId,
      userId,
      ...metadata,
    })

    await this.analyticsRepository.save(analytics)
  }

  async getPodcastAnalytics(podcastId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    const whereClause: any = { podcastId }

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate)
    }

    const analytics = await this.analyticsRepository.find({
      where: whereClause,
    })

    const totalPlays = analytics.filter((a) => a.eventType === AnalyticsEventType.PLAY).length
    const totalDownloads = analytics.filter((a) => a.eventType === AnalyticsEventType.DOWNLOAD).length
    const totalShares = analytics.filter((a) => a.eventType === AnalyticsEventType.SHARE).length
    const completions = analytics.filter((a) => a.eventType === AnalyticsEventType.COMPLETE).length

    const listenEvents = analytics.filter((a) => a.eventType === AnalyticsEventType.PLAY && a.duration)
    const averageListenTime =
      listenEvents.length > 0
        ? listenEvents.reduce((sum, event) => sum + (event.duration || 0), 0) / listenEvents.length
        : 0

    const completionRate = totalPlays > 0 ? (completions / totalPlays) * 100 : 0

    // Top countries
    const countryStats = analytics.reduce(
      (acc, event) => {
        if (event.country) {
          acc[event.country] = (acc[event.country] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Top devices
    const deviceStats = analytics.reduce(
      (acc, event) => {
        if (event.device) {
          acc[event.device] = (acc[event.device] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topDevices = Object.entries(deviceStats)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Daily stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyAnalytics = await this.analyticsRepository
      .createQueryBuilder("analytics")
      .select("DATE(analytics.createdAt)", "date")
      .addSelect("COUNT(CASE WHEN analytics.eventType = :playType THEN 1 END)", "plays")
      .addSelect("COUNT(CASE WHEN analytics.eventType = :downloadType THEN 1 END)", "downloads")
      .where("analytics.podcastId = :podcastId", { podcastId })
      .andWhere("analytics.createdAt >= :startDate", { startDate: thirtyDaysAgo })
      .setParameters({
        playType: AnalyticsEventType.PLAY,
        downloadType: AnalyticsEventType.DOWNLOAD,
      })
      .groupBy("DATE(analytics.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany()

    const dailyStats = dailyAnalytics.map((stat) => ({
      date: stat.date,
      plays: Number.parseInt(stat.plays),
      downloads: Number.parseInt(stat.downloads),
    }))

    return {
      totalPlays,
      totalDownloads,
      totalShares,
      averageListenTime,
      completionRate,
      topCountries,
      topDevices,
      dailyStats,
    }
  }

  async getEpisodeAnalytics(episodeId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    const whereClause: any = { episodeId }

    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate)
    }

    const analytics = await this.analyticsRepository.find({
      where: whereClause,
    })

    // Similar processing as getPodcastAnalytics but for a single episode
    const totalPlays = analytics.filter((a) => a.eventType === AnalyticsEventType.PLAY).length
    const totalDownloads = analytics.filter((a) => a.eventType === AnalyticsEventType.DOWNLOAD).length
    const totalShares = analytics.filter((a) => a.eventType === AnalyticsEventType.SHARE).length
    const completions = analytics.filter((a) => a.eventType === AnalyticsEventType.COMPLETE).length

    const listenEvents = analytics.filter((a) => a.eventType === AnalyticsEventType.PLAY && a.duration)
    const averageListenTime =
      listenEvents.length > 0
        ? listenEvents.reduce((sum, event) => sum + (event.duration || 0), 0) / listenEvents.length
        : 0

    const completionRate = totalPlays > 0 ? (completions / totalPlays) * 100 : 0

    return {
      totalPlays,
      totalDownloads,
      totalShares,
      averageListenTime,
      completionRate,
      topCountries: [],
      topDevices: [],
      dailyStats: [],
    }
  }
}
