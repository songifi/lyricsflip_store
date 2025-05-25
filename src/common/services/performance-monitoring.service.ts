import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { DataSource } from "typeorm"
import type { CacheService } from "./cache.service"

export interface PerformanceMetrics {
  timestamp: Date
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  memoryUsage: NodeJS.MemoryUsage
  dbConnectionsActive: number
  cacheHitRate: number
}

export interface DatabaseMetrics {
  activeConnections: number
  idleConnections: number
  totalConnections: number
  slowQueries: number
  avgQueryTime: number
}

@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name)
  private metrics: PerformanceMetrics[] = []
  private cacheHits = 0
  private cacheMisses = 0

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private cacheService: CacheService,
  ) {
    // Start periodic monitoring
    this.startPeriodicMonitoring()
  }

  recordMetric(metric: Partial<PerformanceMetrics>): void {
    const fullMetric: PerformanceMetrics = {
      timestamp: new Date(),
      endpoint: metric.endpoint || "unknown",
      method: metric.method || "GET",
      responseTime: metric.responseTime || 0,
      statusCode: metric.statusCode || 200,
      memoryUsage: process.memoryUsage(),
      dbConnectionsActive: this.getActiveConnections(),
      cacheHitRate: this.getCacheHitRate(),
    }

    this.metrics.push(fullMetric)

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Log performance alerts
    this.checkPerformanceAlerts(fullMetric)
  }

  recordCacheHit(): void {
    this.cacheHits++
  }

  recordCacheMiss(): void {
    this.cacheMisses++
  }

  private getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses
    return total > 0 ? (this.cacheHits / total) * 100 : 0
  }

  private getActiveConnections(): number {
    // This is a simplified version - in production, you'd want to implement
    // proper connection pool monitoring
    return this.dataSource.isInitialized ? 1 : 0
  }

  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Query PostgreSQL for connection statistics
      const connectionStats = await this.dataSource.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `)

      // Query for slow queries (queries taking more than 5 seconds)
      const slowQueries = await this.dataSource.query(`
        SELECT count(*) as slow_queries
        FROM pg_stat_statements 
        WHERE mean_exec_time > 5000
      `)

      // Average query time
      const avgQueryTime = await this.dataSource.query(`
        SELECT avg(mean_exec_time) as avg_query_time
        FROM pg_stat_statements
      `)

      return {
        activeConnections: connectionStats[0]?.active_connections || 0,
        idleConnections: connectionStats[0]?.idle_connections || 0,
        totalConnections: connectionStats[0]?.total_connections || 0,
        slowQueries: slowQueries[0]?.slow_queries || 0,
        avgQueryTime: avgQueryTime[0]?.avg_query_time || 0,
      }
    } catch (error) {
      this.logger.error("Failed to get database metrics:", error)
      return {
        activeConnections: 0,
        idleConnections: 0,
        totalConnections: 0,
        slowQueries: 0,
        avgQueryTime: 0,
      }
    }
  }

  getRecentMetrics(minutes = 5): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.metrics.filter((metric) => metric.timestamp >= cutoff)
  }

  getAverageResponseTime(endpoint?: string, minutes = 5): number {
    const recentMetrics = this.getRecentMetrics(minutes)
    const filteredMetrics = endpoint ? recentMetrics.filter((m) => m.endpoint === endpoint) : recentMetrics

    if (filteredMetrics.length === 0) return 0

    const totalTime = filteredMetrics.reduce((sum, metric) => sum + metric.responseTime, 0)
    return totalTime / filteredMetrics.length
  }

  private checkPerformanceAlerts(metric: PerformanceMetrics): void {
    const alertThresholds = {
      responseTime: this.configService.get("ALERT_RESPONSE_TIME_MS", 5000),
      memoryUsage: this.configService.get("ALERT_MEMORY_USAGE_MB", 512),
      cacheHitRate: this.configService.get("ALERT_CACHE_HIT_RATE", 80),
    }

    // Response time alert
    if (metric.responseTime > alertThresholds.responseTime) {
      this.sendAlert("HIGH_RESPONSE_TIME", {
        endpoint: metric.endpoint,
        responseTime: metric.responseTime,
        threshold: alertThresholds.responseTime,
      })
    }

    // Memory usage alert
    const memoryUsageMB = metric.memoryUsage.heapUsed / 1024 / 1024
    if (memoryUsageMB > alertThresholds.memoryUsage) {
      this.sendAlert("HIGH_MEMORY_USAGE", {
        memoryUsage: memoryUsageMB,
        threshold: alertThresholds.memoryUsage,
      })
    }

    // Cache hit rate alert
    if (metric.cacheHitRate < alertThresholds.cacheHitRate) {
      this.sendAlert("LOW_CACHE_HIT_RATE", {
        cacheHitRate: metric.cacheHitRate,
        threshold: alertThresholds.cacheHitRate,
      })
    }
  }

  private async sendAlert(type: string, data: any): Promise<void> {
    this.logger.warn(`Performance Alert [${type}]:`, data)

    // In production, you would integrate with alerting services like:
    // - Slack webhooks
    // - PagerDuty
    // - Email notifications
    // - SMS alerts

    try {
      // Example: Send to monitoring service
      await this.cacheService.set(
        `alert:${type}:${Date.now()}`,
        {
          type,
          data,
          timestamp: new Date(),
        },
        { ttl: 3600 },
      )
    } catch (error) {
      this.logger.error("Failed to send alert:", error)
    }
  }

  private startPeriodicMonitoring(): void {
    // Monitor system metrics every 30 seconds
    setInterval(async () => {
      try {
        const dbMetrics = await this.getDatabaseMetrics()
        const memoryUsage = process.memoryUsage()

        // Store metrics for historical analysis
        await this.cacheService.set(
          `metrics:${Date.now()}`,
          {
            timestamp: new Date(),
            database: dbMetrics,
            memory: memoryUsage,
            cacheHitRate: this.getCacheHitRate(),
          },
          { ttl: 86400 },
        ) // Keep for 24 hours
      } catch (error) {
        this.logger.error("Periodic monitoring error:", error)
      }
    }, 30000)
  }
}
