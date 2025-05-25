import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import Redis from "ioredis"

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  compress?: boolean
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private readonly redis: Redis
  private readonly defaultTTL: number

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get("REDIS_HOST", "localhost"),
      port: this.configService.get("REDIS_PORT", 6379),
      password: this.configService.get("REDIS_PASSWORD"),
      db: this.configService.get("REDIS_CACHE_DB", 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    this.defaultTTL = this.configService.get("CACHE_DEFAULT_TTL", 300) // 5 minutes

    this.redis.on("connect", () => {
      this.logger.log("Connected to Redis cache")
    })

    this.redis.on("error", (error) => {
      this.logger.error("Redis cache error:", error)
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      if (!value) return null

      return JSON.parse(value)
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.defaultTTL
      const serializedValue = JSON.stringify(value)

      await this.redis.setex(key, ttl, serializedValue)
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      this.logger.error(`Cache delete pattern error for pattern ${pattern}:`, error)
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys)
      return values.map((value) => (value ? JSON.parse(value) : null))
    } catch (error) {
      this.logger.error(`Cache mget error:`, error)
      return keys.map(() => null)
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.redis.pipeline()
      const expireTTL = ttl || this.defaultTTL

      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, expireTTL, JSON.stringify(value))
      })

      await pipeline.exec()
    } catch (error) {
      this.logger.error(`Cache mset error:`, error)
    }
  }

  // Music-specific cache methods
  async cacheTrack(trackId: string, trackData: any, ttl = 3600): Promise<void> {
    await this.set(`track:${trackId}`, trackData, { ttl })
  }

  async getCachedTrack(trackId: string): Promise<any> {
    return this.get(`track:${trackId}`)
  }

  async cacheAlbum(albumId: string, albumData: any, ttl = 3600): Promise<void> {
    await this.set(`album:${albumId}`, albumData, { ttl })
  }

  async getCachedAlbum(albumId: string): Promise<any> {
    return this.get(`album:${albumId}`)
  }

  async cachePlaylist(playlistId: string, playlistData: any, ttl = 1800): Promise<void> {
    await this.set(`playlist:${playlistId}`, playlistData, { ttl })
  }

  async getCachedPlaylist(playlistId: string): Promise<any> {
    return this.get(`playlist:${playlistId}`)
  }

  async cacheSearchResults(query: string, results: any, ttl = 600): Promise<void> {
    const searchKey = `search:${Buffer.from(query).toString("base64")}`
    await this.set(searchKey, results, { ttl })
  }

  async getCachedSearchResults(query: string): Promise<any> {
    const searchKey = `search:${Buffer.from(query).toString("base64")}`
    return this.get(searchKey)
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}:*`)
  }

  async invalidateTrackCache(trackId: string): Promise<void> {
    await this.delPattern(`track:${trackId}*`)
  }
}
