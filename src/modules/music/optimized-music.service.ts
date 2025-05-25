import { Injectable, Logger } from "@nestjs/common"
import type { Repository, SelectQueryBuilder } from "typeorm"
import type { CacheService } from "../../../common/services/cache.service"
import type { PerformanceMonitoringService } from "../../../common/services/performance-monitoring.service"

// Assuming these entities exist in your project
interface Track {
  id: string
  title: string
  artistId: string
  albumId: string
  duration: number
  genre: string
  playCount: number
  createdAt: Date
}

interface Album {
  id: string
  title: string
  artistId: string
  releaseDate: Date
  tracks: Track[]
}

interface SearchFilters {
  genre?: string
  artist?: string
  album?: string
  year?: number
  duration?: { min?: number; max?: number }
}

interface PaginationOptions {
  page: number
  limit: number
}

@Injectable()
export class OptimizedMusicService {
  private readonly logger = new Logger(OptimizedMusicService.name)

  constructor(
    private trackRepository: Repository<Track>,
    private albumRepository: Repository<Album>,
    private cacheService: CacheService,
    private performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  async findPopularTracks(limit = 50): Promise<Track[]> {
    const cacheKey = `popular-tracks:${limit}`

    // Try cache first
    let tracks = await this.cacheService.getCachedTrack(cacheKey)
    if (tracks) {
      this.performanceMonitoringService.recordCacheHit()
      return tracks
    }

    this.performanceMonitoringService.recordCacheMiss()

    // Optimized query with proper indexing
    tracks = await this.trackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.artist", "artist")
      .leftJoinAndSelect("track.album", "album")
      .orderBy("track.playCount", "DESC")
      .addOrderBy("track.createdAt", "DESC")
      .limit(limit)
      .cache(true) // Enable TypeORM query cache
      .getMany()

    // Cache the results
    await this.cacheService.cacheTrack(cacheKey, tracks, 1800) // 30 minutes

    return tracks
  }

  async searchTracks(
    query: string,
    filters: SearchFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<{ tracks: Track[]; total: number }> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}:${pagination.page}:${pagination.limit}`

    // Check cache
    let result = await this.cacheService.getCachedSearchResults(cacheKey)
    if (result) {
      this.performanceMonitoringService.recordCacheHit()
      return result
    }

    this.performanceMonitoringService.recordCacheMiss()

    // Build optimized search query
    const queryBuilder = this.buildSearchQuery(query, filters)

    // Get total count for pagination
    const total = await queryBuilder.getCount()

    // Get paginated results
    const tracks = await queryBuilder
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .cache(true)
      .getMany()

    result = { tracks, total }

    // Cache search results for 10 minutes
    await this.cacheService.cacheSearchResults(cacheKey, result, 600)

    return result
  }

  private buildSearchQuery(query: string, filters: SearchFilters): SelectQueryBuilder<Track> {
    const queryBuilder = this.trackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.artist", "artist")
      .leftJoinAndSelect("track.album", "album")
      .leftJoinAndSelect("track.genre", "genre")

    // Full-text search optimization
    if (query) {
      queryBuilder.where(
        `(
          to_tsvector('english', track.title) @@ plainto_tsquery('english', :query) OR
          to_tsvector('english', artist.name) @@ plainto_tsquery('english', :query) OR
          to_tsvector('english', album.title) @@ plainto_tsquery('english', :query)
        )`,
        { query },
      )
    }

    // Apply filters
    if (filters.genre) {
      queryBuilder.andWhere("genre.name = :genre", { genre: filters.genre })
    }

    if (filters.artist) {
      queryBuilder.andWhere("artist.name ILIKE :artist", { artist: `%${filters.artist}%` })
    }

    if (filters.album) {
      queryBuilder.andWhere("album.title ILIKE :album", { album: `%${filters.album}%` })
    }

    if (filters.year) {
      queryBuilder.andWhere("EXTRACT(YEAR FROM album.releaseDate) = :year", { year: filters.year })
    }

    if (filters.duration) {
      if (filters.duration.min) {
        queryBuilder.andWhere("track.duration >= :minDuration", { minDuration: filters.duration.min })
      }
      if (filters.duration.max) {
        queryBuilder.andWhere("track.duration <= :maxDuration", { maxDuration: filters.duration.max })
      }
    }

    // Optimize ordering for performance
    queryBuilder.orderBy("track.playCount", "DESC").addOrderBy("track.createdAt", "DESC")

    return queryBuilder
  }

  async getTracksByAlbum(albumId: string): Promise<Track[]> {
    const cacheKey = `album-tracks:${albumId}`

    let tracks = await this.cacheService.getCachedTrack(cacheKey)
    if (tracks) {
      this.performanceMonitoringService.recordCacheHit()
      return tracks
    }

    this.performanceMonitoringService.recordCacheMiss()

    tracks = await this.trackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.artist", "artist")
      .where("track.albumId = :albumId", { albumId })
      .orderBy("track.trackNumber", "ASC")
      .cache(true)
      .getMany()

    await this.cacheService.cacheTrack(cacheKey, tracks, 3600) // 1 hour

    return tracks
  }

  async getRecommendedTracks(userId: string, limit = 20): Promise<Track[]> {
    const cacheKey = `recommendations:${userId}:${limit}`

    let tracks = await this.cacheService.get(cacheKey)
    if (tracks) {
      this.performanceMonitoringService.recordCacheHit()
      return tracks
    }

    this.performanceMonitoringService.recordCacheMiss()

    // Complex recommendation query optimized with proper indexes
    tracks = await this.trackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.artist", "artist")
      .leftJoinAndSelect("track.album", "album")
      .leftJoin("user_listening_history", "history", "history.trackId = track.id")
      .leftJoin("user_preferences", "prefs", "prefs.userId = :userId", { userId })
      .where("track.genre IN (SELECT genre FROM user_preferences WHERE userId = :userId)", { userId })
      .andWhere("track.id NOT IN (SELECT trackId FROM user_listening_history WHERE userId = :userId)")
      .orderBy("track.playCount", "DESC")
      .addOrderBy("RANDOM()") // Add some randomness
      .limit(limit)
      .cache(true)
      .getMany()

    await this.cacheService.set(cacheKey, tracks, { ttl: 1800 }) // 30 minutes

    return tracks
  }

  async incrementPlayCount(trackId: string): Promise<void> {
    // Use optimized update query
    await this.trackRepository
      .createQueryBuilder()
      .update(Track)
      .set({ playCount: () => "playCount + 1" })
      .where("id = :trackId", { trackId })
      .execute()

    // Invalidate related caches
    await this.cacheService.invalidateTrackCache(trackId)
    await this.cacheService.delPattern("popular-tracks:*")
  }

  async getTrackAnalytics(trackId: string): Promise<any> {
    const cacheKey = `track-analytics:${trackId}`

    let analytics = await this.cacheService.get(cacheKey)
    if (analytics) {
      return analytics
    }

    // Complex analytics query with proper aggregation
    const result = await this.trackRepository
      .createQueryBuilder("track")
      .select([
        "track.id",
        "track.title",
        "track.playCount",
        "COUNT(DISTINCT history.userId) as uniqueListeners",
        "AVG(history.listenDuration) as avgListenDuration",
        "COUNT(history.id) as totalPlays",
      ])
      .leftJoin("user_listening_history", "history", "history.trackId = track.id")
      .where("track.id = :trackId", { trackId })
      .groupBy("track.id")
      .cache(true)
      .getRawOne()

    analytics = {
      ...result,
      uniqueListeners: Number.parseInt(result.uniqueListeners) || 0,
      avgListenDuration: Number.parseFloat(result.avgListenDuration) || 0,
      totalPlays: Number.parseInt(result.totalPlays) || 0,
    }

    await this.cacheService.set(cacheKey, analytics, { ttl: 3600 }) // 1 hour

    return analytics
  }
}
