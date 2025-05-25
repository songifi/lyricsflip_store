import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { VideoView } from "../entities/video-view.entity"
import type { Video } from "../entities/video.entity"

interface ViewAnalytics {
  totalViews: number
  uniqueViews: number
  averageWatchTime: number
  completionRate: number
  topCountries: Array<{ country: string; views: number }>
  topDevices: Array<{ device: string; views: number }>
  viewsByDate: Array<{ date: string; views: number }>
}

interface VideoAnalytics extends ViewAnalytics {
  video: Video
  engagementRate: number
  shareRate: number
}

@Injectable()
export class VideoAnalyticsService {
  private readonly logger = new Logger(VideoAnalyticsService.name)

  constructor(
    private readonly videoViewRepository: Repository<VideoView> = null,
    private readonly videoRepository: Repository<Video> = null,
  ) {}

  async recordView(
    videoId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    watchDuration?: number,
    completionPercentage?: number,
  ): Promise<VideoView> {
    // Check if this user/IP already viewed this video today
    const existingView = await this.videoViewRepository.findOne({
      where: [
        { videoId, userId, createdAt: new Date() },
        { videoId, ipAddress, createdAt: new Date() },
      ],
    })

    if (existingView) {
      // Update existing view with new watch data
      if (watchDuration !== undefined) {
        existingView.watchDuration = Math.max(existingView.watchDuration, watchDuration)
      }
      if (completionPercentage !== undefined) {
        existingView.completionPercentage = Math.max(existingView.completionPercentage, completionPercentage)
      }
      return await this.videoViewRepository.save(existingView)
    }

    // Create new view record
    const view = this.videoViewRepository.create({
      videoId,
      userId,
      ipAddress,
      userAgent,
      watchDuration: watchDuration || 0,
      completionPercentage: completionPercentage || 0,
      // You would implement geolocation and device detection here
      country: await this.getCountryFromIP(ipAddress),
      device: this.getDeviceFromUserAgent(userAgent),
      browser: this.getBrowserFromUserAgent(userAgent),
    })

    return await this.videoViewRepository.save(view)
  }

  async getVideoAnalytics(videoId: string, days = 30): Promise<VideoAnalytics> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ["views"],
    })

    if (!video) {
      throw new Error("Video not found")
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const views = await this.videoViewRepository
      .createQueryBuilder("view")
      .where("view.videoId = :videoId", { videoId })
      .andWhere("view.createdAt >= :startDate", { startDate })
      .getMany()

    const totalViews = views.length
    const uniqueViews = new Set(views.map((v) => v.userId || v.ipAddress)).size
    const averageWatchTime = views.reduce((sum, v) => sum + v.watchDuration, 0) / totalViews || 0
    const completionRate = views.reduce((sum, v) => sum + v.completionPercentage, 0) / totalViews || 0

    // Top countries
    const countryMap = new Map<string, number>()
    views.forEach((view) => {
      if (view.country) {
        countryMap.set(view.country, (countryMap.get(view.country) || 0) + 1)
      }
    })
    const topCountries = Array.from(countryMap.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top devices
    const deviceMap = new Map<string, number>()
    views.forEach((view) => {
      if (view.device) {
        deviceMap.set(view.device, (deviceMap.get(view.device) || 0) + 1)
      }
    })
    const topDevices = Array.from(deviceMap.entries())
      .map(([device, views]) => ({ device, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Views by date
    const dateMap = new Map<string, number>()
    views.forEach((view) => {
      const date = view.createdAt.toISOString().split("T")[0]
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })
    const viewsByDate = Array.from(dateMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate engagement and share rates
    const engagementRate = totalViews > 0 ? (video.likeCount / totalViews) * 100 : 0
    const shareRate = totalViews > 0 ? (video.shareCount / totalViews) * 100 : 0

    return {
      video,
      totalViews,
      uniqueViews,
      averageWatchTime,
      completionRate,
      topCountries,
      topDevices,
      viewsByDate,
      engagementRate,
      shareRate,
    }
  }

  async getArtistVideoAnalytics(artistId: string, days = 30): Promise<any> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await this.videoViewRepository
      .createQueryBuilder("view")
      .leftJoin("view.video", "video")
      .where("video.artistId = :artistId", { artistId })
      .andWhere("view.createdAt >= :startDate", { startDate })
      .select([
        "COUNT(*) as totalViews",
        "COUNT(DISTINCT COALESCE(view.userId, view.ipAddress)) as uniqueViews",
        "AVG(view.watchDuration) as averageWatchTime",
        "AVG(view.completionPercentage) as completionRate",
      ])
      .getRawOne()

    return {
      totalViews: Number.parseInt(result.totalViews) || 0,
      uniqueViews: Number.parseInt(result.uniqueViews) || 0,
      averageWatchTime: Number.parseFloat(result.averageWatchTime) || 0,
      completionRate: Number.parseFloat(result.completionRate) || 0,
    }
  }

  async getTrendingVideos(limit = 10, days = 7): Promise<Video[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trendingVideoIds = await this.videoViewRepository
      .createQueryBuilder("view")
      .select("view.videoId")
      .addSelect("COUNT(*)", "viewCount")
      .where("view.createdAt >= :startDate", { startDate })
      .groupBy("view.videoId")
      .orderBy("viewCount", "DESC")
      .limit(limit)
      .getRawMany()

    const videoIds = trendingVideoIds.map((item) => item.videoId)

    if (videoIds.length === 0) {
      return []
    }

    return await this.videoRepository
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.artist", "artist")
      .leftJoinAndSelect("video.track", "track")
      .where("video.id IN (:...videoIds)", { videoIds })
      .orderBy(`CASE video.id ${videoIds.map((id, index) => `WHEN '${id}' THEN ${index}`).join(" ")} END`)
      .getMany()
  }

  private async getCountryFromIP(ipAddress: string): Promise<string | null> {
    // Implement IP geolocation service integration
    // You could use services like MaxMind, IPStack, etc.
    return null
  }

  private getDeviceFromUserAgent(userAgent: string): string | null {
    if (!userAgent) return null

    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return "Mobile"
    } else if (/Tablet/.test(userAgent)) {
      return "Tablet"
    } else {
      return "Desktop"
    }
  }

  private getBrowserFromUserAgent(userAgent: string): string | null {
    if (!userAgent) return null

    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"

    return "Other"
  }
}
