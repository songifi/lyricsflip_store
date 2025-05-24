import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Playlist } from "../../../database/entities/playlist.entity"
import { PlaylistTrack } from "../../../database/entities/playlist-track.entity"
import { Track } from "../../../database/entities/track.entity"

@Injectable()
export class SmartPlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    @InjectRepository(PlaylistTrack)
    private readonly playlistTrackRepository: Repository<PlaylistTrack>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
  ) {}

  async updateSmartPlaylist(playlistId: string): Promise<void> {
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
    })

    if (!playlist || !playlist.smartCriteria) {
      return
    }

    // Clear existing tracks
    await this.playlistTrackRepository.delete({ playlistId })

    // Build query based on criteria
    const queryBuilder = this.trackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.artist", "artist")
      .leftJoinAndSelect("track.album", "album")
      .leftJoinAndSelect("track.genres", "genres")

    const criteria = playlist.smartCriteria

    // Apply filters
    if (criteria.genres && criteria.genres.length > 0) {
      queryBuilder.andWhere("genres.name IN (:...genres)", {
        genres: criteria.genres,
      })
    }

    if (criteria.artists && criteria.artists.length > 0) {
      queryBuilder.andWhere("artist.id IN (:...artists)", {
        artists: criteria.artists,
      })
    }

    if (criteria.minDuration) {
      queryBuilder.andWhere("track.duration >= :minDuration", {
        minDuration: criteria.minDuration,
      })
    }

    if (criteria.maxDuration) {
      queryBuilder.andWhere("track.duration <= :maxDuration", {
        maxDuration: criteria.maxDuration,
      })
    }

    if (criteria.minReleaseYear) {
      queryBuilder.andWhere("EXTRACT(YEAR FROM album.releaseDate) >= :minYear", {
        minYear: criteria.minReleaseYear,
      })
    }

    if (criteria.maxReleaseYear) {
      queryBuilder.andWhere("EXTRACT(YEAR FROM album.releaseDate) <= :maxYear", {
        maxYear: criteria.maxReleaseYear,
      })
    }

    if (criteria.mood && criteria.mood.length > 0) {
      queryBuilder.andWhere("track.mood IN (:...moods)", {
        moods: criteria.mood,
      })
    }

    if (criteria.energy) {
      queryBuilder.andWhere("track.energy >= :minEnergy AND track.energy <= :maxEnergy", {
        minEnergy: criteria.energy.min,
        maxEnergy: criteria.energy.max,
      })
    }

    // Apply limit
    if (criteria.limit) {
      queryBuilder.limit(criteria.limit)
    }

    // Add some randomization for variety
    queryBuilder.orderBy("RANDOM()")

    const tracks = await queryBuilder.getMany()

    // Add tracks to playlist
    const playlistTracks = tracks.map((track, index) =>
      this.playlistTrackRepository.create({
        playlistId,
        trackId: track.id,
        position: index,
        addedById: playlist.createdById,
      }),
    )

    if (playlistTracks.length > 0) {
      await this.playlistTrackRepository.save(playlistTracks)
    }

    // Update playlist stats
    await this.updatePlaylistStats(playlistId)
  }

  async updateAllSmartPlaylists(): Promise<void> {
    const smartPlaylists = await this.playlistRepository.find({
      where: { type: "smart" },
    })

    for (const playlist of smartPlaylists) {
      await this.updateSmartPlaylist(playlist.id)
    }
  }

  private async updatePlaylistStats(playlistId: string): Promise<void> {
    const stats = await this.playlistTrackRepository
      .createQueryBuilder("pt")
      .leftJoin("pt.track", "track")
      .select("COUNT(pt.id)", "trackCount")
      .addSelect("COALESCE(SUM(track.duration), 0)", "totalDuration")
      .where("pt.playlistId = :playlistId", { playlistId })
      .getRawOne()

    await this.playlistRepository.update(playlistId, {
      trackCount: Number.parseInt(stats.trackCount),
      totalDuration: Number.parseInt(stats.totalDuration),
    })
  }
}
