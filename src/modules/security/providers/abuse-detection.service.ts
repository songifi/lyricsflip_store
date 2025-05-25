import { Injectable } from "@nestjs/common"
import type { Redis } from "ioredis"

export interface AbusePattern {
  type: "rapid_streaming" | "download_abuse" | "api_scraping" | "bot_activity"
  threshold: number
  windowMs: number
  action: "warn" | "throttle" | "block"
}

export interface AbuseDetectionResult {
  isAbusive: boolean
  pattern?: AbusePattern
  severity: "low" | "medium" | "high"
  recommendedAction: "monitor" | "throttle" | "block"
}

@Injectable()
export class AbuseDetectionService {
  private readonly patterns: AbusePattern[] = [
    {
      type: "rapid_streaming",
      threshold: 100, // 100 streams per minute
      windowMs: 60000,
      action: "throttle",
    },
    {
      type: "download_abuse",
      threshold: 50, // 50 downloads per hour
      windowMs: 3600000,
      action: "block",
    },
    {
      type: "api_scraping",
      threshold: 1000, // 1000 API calls per minute
      windowMs: 60000,
      action: "block",
    },
    {
      type: "bot_activity",
      threshold: 500, // 500 requests per minute
      windowMs: 60000,
      action: "throttle",
    },
  ]

  constructor(private readonly redis: Redis) {}

  async detectStreamingAbuse(userId: string, trackId: string): Promise<AbuseDetectionResult> {
    const key = `abuse:streaming:${userId}`
    const count = await this.redis.incr(key)

    if (count === 1) {
      await this.redis.expire(key, 60) // 1 minute window
    }

    const pattern = this.patterns.find((p) => p.type === "rapid_streaming")

    if (count > pattern.threshold) {
      await this.logAbuseIncident(userId, "rapid_streaming", { trackId, count })

      return {
        isAbusive: true,
        pattern,
        severity: "high",
        recommendedAction: "throttle",
      }
    }

    return {
      isAbusive: false,
      severity: "low",
      recommendedAction: "monitor",
    }
  }

  async detectApiAbuse(userId: string, endpoint: string, userAgent?: string): Promise<AbuseDetectionResult> {
    // Check for bot patterns
    if (this.isSuspiciousUserAgent(userAgent)) {
      return {
        isAbusive: true,
        severity: "medium",
        recommendedAction: "throttle",
      }
    }

    const key = `abuse:api:${userId}:${endpoint}`
    const count = await this.redis.incr(key)

    if (count === 1) {
      await this.redis.expire(key, 60)
    }

    const pattern = this.patterns.find((p) => p.type === "api_scraping")

    if (count > pattern.threshold) {
      await this.logAbuseIncident(userId, "api_scraping", { endpoint, count, userAgent })

      return {
        isAbusive: true,
        pattern,
        severity: "high",
        recommendedAction: "block",
      }
    }

    return {
      isAbusive: false,
      severity: "low",
      recommendedAction: "monitor",
    }
  }

  async detectDownloadAbuse(userId: string): Promise<AbuseDetectionResult> {
    const key = `abuse:download:${userId}`
    const count = await this.redis.incr(key)

    if (count === 1) {
      await this.redis.expire(key, 3600) // 1 hour window
    }

    const pattern = this.patterns.find((p) => p.type === "download_abuse")

    if (count > pattern.threshold) {
      await this.logAbuseIncident(userId, "download_abuse", { count })

      return {
        isAbusive: true,
        pattern,
        severity: "high",
        recommendedAction: "block",
      }
    }

    return {
      isAbusive: false,
      severity: "low",
      recommendedAction: "monitor",
    }
  }

  private isSuspiciousUserAgent(userAgent?: string): boolean {
    if (!userAgent) return true

    const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /requests/i]

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent))
  }

  private async logAbuseIncident(userId: string, type: string, metadata: Record<string, any>): Promise<void> {
    const incident = {
      userId,
      type,
      timestamp: new Date().toISOString(),
      metadata,
    }

    // Store in Redis for immediate access
    await this.redis.lpush("abuse_incidents", JSON.stringify(incident))
    await this.redis.ltrim("abuse_incidents", 0, 999) // Keep last 1000 incidents

    // You might also want to store in your main database
    console.warn("Abuse detected:", incident)
  }
}
