import { Injectable } from "@nestjs/common"
import type { Redis } from "ioredis"

export interface SecurityEvent {
  type: "rate_limit_exceeded" | "invalid_api_key" | "abuse_detected" | "unauthorized_access"
  userId?: string
  ip: string
  userAgent?: string
  endpoint: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface SecurityMetrics {
  totalRequests: number
  blockedRequests: number
  rateLimitViolations: number
  abuseIncidents: number
  topAbusiveIps: Array<{ ip: string; count: number }>
  topEndpoints: Array<{ endpoint: string; count: number }>
}

@Injectable()
export class SecurityMonitoringService {
  constructor(private readonly redis: Redis) {}

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const eventData = {
      ...event,
      timestamp: event.timestamp.toISOString(),
    }

    // Store event
    await this.redis.lpush("security_events", JSON.stringify(eventData))
    await this.redis.ltrim("security_events", 0, 9999) // Keep last 10k events

    // Update metrics
    await this.updateMetrics(event)

    // Check for alerts
    await this.checkAlerts(event)
  }

  async getSecurityMetrics(timeRange: "1h" | "24h" | "7d" = "24h"): Promise<SecurityMetrics> {
    const now = Date.now()
    const timeRangeMs = this.getTimeRangeMs(timeRange)
    const since = now - timeRangeMs

    const events = await this.getEventsInRange(since)

    return {
      totalRequests: events.length,
      blockedRequests: events.filter((e) => e.type === "rate_limit_exceeded" || e.type === "abuse_detected").length,
      rateLimitViolations: events.filter((e) => e.type === "rate_limit_exceeded").length,
      abuseIncidents: events.filter((e) => e.type === "abuse_detected").length,
      topAbusiveIps: this.getTopIps(events),
      topEndpoints: this.getTopEndpoints(events),
    }
  }

  async getRecentAlerts(limit = 50): Promise<SecurityEvent[]> {
    const alertTypes = ["abuse_detected", "rate_limit_exceeded"]
    const events = await this.getEventsInRange(Date.now() - 3600000) // Last hour

    return events.filter((event) => alertTypes.includes(event.type)).slice(0, limit)
  }

  private async updateMetrics(event: SecurityEvent): Promise<void> {
    const hour = Math.floor(Date.now() / 3600000)
    const key = `metrics:${hour}`

    await this.redis.hincrby(key, "total_requests", 1)
    await this.redis.hincrby(key, `${event.type}_count`, 1)
    await this.redis.hincrby(key, `ip:${event.ip}`, 1)
    await this.redis.hincrby(key, `endpoint:${event.endpoint}`, 1)
    await this.redis.expire(key, 86400 * 7) // Keep for 7 days
  }

  private async checkAlerts(event: SecurityEvent): Promise<void> {
    // Check for suspicious patterns
    if (event.type === "abuse_detected") {
      await this.sendAlert("high", `Abuse detected from IP ${event.ip}`, event)
    }

    // Check for repeated violations from same IP
    const recentEvents = await this.getEventsFromIp(event.ip, 300000) // Last 5 minutes
    if (recentEvents.length > 10) {
      await this.sendAlert("medium", `High activity from IP ${event.ip}`, event)
    }
  }

  private async sendAlert(severity: "low" | "medium" | "high", message: string, event: SecurityEvent): Promise<void> {
    const alert = {
      severity,
      message,
      event,
      timestamp: new Date().toISOString(),
    }

    // Store alert
    await this.redis.lpush("security_alerts", JSON.stringify(alert))
    await this.redis.ltrim("security_alerts", 0, 999)

    // In production, you might want to send to external monitoring services
    console.warn(`Security Alert [${severity.toUpperCase()}]: ${message}`, event)
  }

  private async getEventsInRange(since: number): Promise<SecurityEvent[]> {
    const events = await this.redis.lrange("security_events", 0, -1)
    return events.map((event) => JSON.parse(event)).filter((event) => new Date(event.timestamp).getTime() > since)
  }

  private async getEventsFromIp(ip: string, timeRange: number): Promise<SecurityEvent[]> {
    const since = Date.now() - timeRange
    const events = await this.getEventsInRange(since)
    return events.filter((event) => event.ip === ip)
  }

  private getTimeRangeMs(range: string): number {
    switch (range) {
      case "1h":
        return 3600000
      case "24h":
        return 86400000
      case "7d":
        return 604800000
      default:
        return 86400000
    }
  }

  private getTopIps(events: SecurityEvent[]): Array<{ ip: string; count: number }> {
    const ipCounts = events.reduce(
      (acc, event) => {
        acc[event.ip] = (acc[event.ip] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private getTopEndpoints(events: SecurityEvent[]): Array<{ endpoint: string; count: number }> {
    const endpointCounts = events.reduce(
      (acc, event) => {
        acc[event.endpoint] = (acc[event.endpoint] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}
