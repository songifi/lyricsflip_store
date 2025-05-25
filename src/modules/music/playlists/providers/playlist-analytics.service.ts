import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Playlist } from "../../../database/entities/playlist.entity"
import type { PlaylistTrack } from "../../../database/entities/playlist-track.entity"
import type { PlaylistFollow } from "../../../database/entities/playlist-follow.entity"

export interface PlaylistAnalytics {
  totalPlaylists: number
  totalTracks: number
  totalFollows: number
  averageTracksPerPlaylist: number
  mostPopularPlaylists: Array<{
    id: string
    name: string
    followersCount: number
    playsCount: number
  }>
  playlistGrowth: Array<{
    date: string
    count: number
  }>
  collaborativePlaylistsCount: number
  smartPlaylistsCount: number
  privacyDistribution: {
    public: number
    private: number
    unlisted: number
  }
}

@Injectable()
export class PlaylistAnalyticsService {
  constructor(
    private playlistRepository: Repository<Playlist>,
    private playlistTrackRepository: Repository<PlaylistTrack>,
    private followRepository: Repository<PlaylistFollow>,
  ) {}

  async getPlaylistAnalytics(startDate?: Date, endDate?: Date): Promise<PlaylistAnalytics> {
    const whereClause = this.buildDateWhereClause(startDate, endDate)

    const [
      totalPlaylists,
      totalTracks,
      totalFollows,
      mostPopularPlaylists,
      playlistGrowth,
      collaborativeCount,
      smartCount,
      privacyDistribution,
    ] = await Promise.all([
      this.getTotalPlaylists(whereClause),
      this.getTotalTracks(whereClause),
      this.getTotalFollows(whereClause),
      this.getMostPopularPlaylists(10),
      this.getPlaylistGrowth(startDate, endDate),
      this.getCollaborativePlaylistsCount(whereClause),
      this.getSmartPlaylistsCount(whereClause),
      this.getPrivacyDistribution(whereClause),
    ])

    const averageTracksPerPlaylist = totalPlaylists > 0 ? totalTracks / totalPlaylists : 0

    return {
      totalPlaylists,
      totalTracks,
      totalFollows,
      averageTracksPerPlaylist: Math.round(averageTracksPerPlaylist * 100) / 100,
      mostPopularPlaylists,
      playlistGrowth,
      collaborativePlaylistsCount: collaborativeCount,
      smartPlaylistsCount: smartCount,
      privacyDistribution,
    }
  }

  async getUserPlaylistAnalytics(userId: string): Promise<{
    totalPlaylists: number
    totalTracks: number
    totalFollowers: number
    mostPopularPlaylist: {
      id: string
      name: string
      followersCount: number
      playsCount: number
    } | null
    playlistsByPrivacy: {
      public: number
      private: number
      unlisted: number
    }
    collaborativePlaylists: number
    smartPlaylists: number
  }> {
    const userPlaylists = await this.playlistRepository.find({
      where: { createdById: userId },
      select: ["id", "name", "privacy", "type", "isCollaborative", "trackCount", "followersCount", "playsCount"],
    })

    const totalPlaylists = userPlaylists.length
    const totalTracks = userPlaylists.reduce((sum, p) => sum + p.trackCount, 0)
    const totalFollowers = userPlaylists.reduce((sum, p) => sum + p.followersCount, 0)

    const mostPopularPlaylist = userPlaylists.reduce((max, playlist) => {
      if (!max || playlist.followersCount > max.followersCount) {
        return {
          id: playlist.id,
          name: playlist.name,
          followersCount: playlist.followersCount,
          playsCount: playlist.playsCount,
        }
      }
      return max
    }, null)

    const playlistsByPrivacy = userPlaylists.reduce(
      (acc, playlist) => {
        acc[playlist.privacy]++
        return acc
      },
      { public: 0, private: 0, unlisted: 0 },
    )

    const collaborativePlaylists = userPlaylists.filter((p) => p.isCollaborative).length
    const smartPlaylists = userPlaylists.filter((p) => p.type === "smart").length

    return {
      totalPlaylists,
      totalTracks,
      totalFollowers,
      mostPopularPlaylist,
      playlistsByPrivacy,
      collaborativePlaylists,
      smartPlaylists,
    }
  }

  private buildDateWhereClause(startDate?: Date, endDate?: Date): string {
    const conditions = []

    if (startDate) {
      conditions.push(`playlist.createdAt >= '${startDate.toISOString()}'`)
    }

    if (endDate) {
      conditions.push(`playlist.createdAt <= '${endDate.toISOString()}'`)
    }

    return conditions.length > 0 ? conditions.join(" AND ") : "1=1"
  }

  private async getTotalPlaylists(whereClause: string): Promise<number> {
    const result = await this.playlistRepository
      .createQueryBuilder("playlist")
      .select("COUNT(*)", "count")
      .where(whereClause)
      .getRawOne()

    return Number.parseInt(result.count)
  }

  private async getTotalTracks(whereClause: string): Promise<number> {
    const result = await this.playlistRepository
      .createQueryBuilder("playlist")
      .select("SUM(playlist.trackCount)", "total")
      .where(whereClause)
      .getRawOne()

    return Number.parseInt(result.total) || 0
  }

  private async getTotalFollows(whereClause: string): Promise<number> {
    const result = await this.playlistRepository
      .createQueryBuilder("playlist")
      .select("SUM(playlist.followersCount)", "total")
      .where(whereClause)
      .getRawOne()

    return Number.parseInt(result.total) || 0
  }

  private async getMostPopularPlaylists(limit: number): Promise<
    Array<{
      id: string
      name: string
      followersCount: number
      playsCount: number
    }>
  > {
    return this.playlistRepository
      .createQueryBuilder("playlist")
      .select(["playlist.id", "playlist.name", "playlist.followersCount", "playlist.playsCount"])
      .where("playlist.privacy = :privacy", { privacy: "public" })
      .orderBy("playlist.followersCount", "DESC")
      .addOrderBy("playlist.playsCount", "DESC")
      .limit(limit)
      .getMany()
  }

  private async getPlaylistGrowth(
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      date: string
      count: number
    }>
  > {
    const queryBuilder = this.playlistRepository
      .createQueryBuilder("playlist")
      .select("DATE(playlist.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .groupBy("DATE(playlist.createdAt)")
      .orderBy("DATE(playlist.createdAt)", "ASC")

    if (startDate) {
      queryBuilder.andWhere("playlist.createdAt >= :startDate", { startDate })
    }

    if (endDate) {
      queryBuilder.andWhere("playlist.createdAt <= :endDate", { endDate })
    }

    const results = await queryBuilder.getRawMany()

    return results.map((result) => ({
      date: result.date,
      count: Number.parseInt(result.count),
    }))
  }

  private async getCollaborativePlaylistsCount(whereClause: string): Promise<number> {
    const result = await this.playlistRepository
      .createQueryBuilder("playlist")
      .select("COUNT(*)", "count")
      .where(whereClause)
      .andWhere("playlist.isCollaborative = true")
      .getRawOne()

    return Number.parseInt(result.count)
  }

  private async getSmartPlaylistsCount(whereClause: string): Promise<number> {
    const result = await this.playlistRepository
      .createQueryBuilder("playlist")
      .select("COUNT(*)", "count")
      .where(whereClause)
      .andWhere("playlist.type = :type", { type: "smart" })
      .getRawOne()

    return Number.parseInt(result.count)
  }

  private async getPrivacyDistribution(whereClause: string): Promise<{
    public: number
    private: number
    unlisted: number
  }> {
    const results = await this.playlistRepository
      .createQueryBuilder("playlist")
      .select("playlist.privacy", "privacy")
      .addSelect("COUNT(*)", "count")
      .where(whereClause)
      .groupBy("playlist.privacy")
      .getRawMany()

    const distribution = { public: 0, private: 0, unlisted: 0 }

    results.forEach((result) => {
      distribution[result.privacy] = Number.parseInt(result.count)
    })

    return distribution
  }
}
