import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, SelectQueryBuilder } from "typeorm"
import { v4 as uuidv4 } from "uuid"
import { type Playlist, PlaylistPrivacy, PlaylistType } from "../../../database/entities/playlist.entity"
import type { PlaylistTrack } from "../../../database/entities/playlist-track.entity"
import { type PlaylistCollaborator, CollaboratorRole } from "../../../database/entities/playlist-collaborator.entity"
import { PlaylistFollow } from "../../../database/entities/playlist-follow.entity"
import { Track } from "../../../database/entities/track.entity"
import { User } from "../../../database/entities/user.entity"
import type { CreatePlaylistDto } from "./dto/create-playlist.dto"
import type { UpdatePlaylistDto } from "./dto/update-playlist.dto"
import type { AddTrackDto } from "./dto/add-track.dto"
import type { AddCollaboratorDto } from "./dto/add-collaborator.dto"
import type { PlaylistQueryDto } from "./dto/playlist-query.dto"
import type { SmartPlaylistService } from "./smart-playlist.service"

@Injectable()
export class PlaylistsService {
  constructor(
    private playlistRepository: Repository<Playlist>,
    private playlistTrackRepository: Repository<PlaylistTrack>,
    private collaboratorRepository: Repository<PlaylistCollaborator>,
    private collaboratorRepository: Repository<PlaylistCollaborator>,
    @InjectRepository(PlaylistFollow)
    private followRepository: Repository<PlaylistFollow>,
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private smartPlaylistService: SmartPlaylistService,
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto, userId: string): Promise<Playlist> {
    const shareToken = uuidv4()

    const playlist = this.playlistRepository.create({
      ...createPlaylistDto,
      createdById: userId,
      shareToken,
    })

    const savedPlaylist = await this.playlistRepository.save(playlist)

    // If it's a smart playlist, generate tracks
    if (playlist.type === PlaylistType.SMART && playlist.smartCriteria) {
      await this.smartPlaylistService.updateSmartPlaylist(savedPlaylist.id)
    }

    return this.findOne(savedPlaylist.id, userId)
  }

  async findAll(
    query: PlaylistQueryDto,
    userId?: string,
  ): Promise<{
    playlists: Playlist[]
    total: number
    page: number
    limit: number
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      privacy,
      type,
      createdBy,
      isCollaborative,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = query

    const queryBuilder = this.createBaseQuery()

    // Apply filters
    if (search) {
      queryBuilder.andWhere("(playlist.name ILIKE :search OR playlist.description ILIKE :search)", {
        search: `%${search}%`,
      })
    }

    if (privacy) {
      queryBuilder.andWhere("playlist.privacy = :privacy", { privacy })
    } else if (!userId) {
      // Only show public playlists for unauthenticated users
      queryBuilder.andWhere("playlist.privacy = :privacy", { privacy: PlaylistPrivacy.PUBLIC })
    }

    if (type) {
      queryBuilder.andWhere("playlist.type = :type", { type })
    }

    if (createdBy) {
      queryBuilder.andWhere("playlist.createdById = :createdBy", { createdBy })
    }

    if (isCollaborative !== undefined) {
      queryBuilder.andWhere("playlist.isCollaborative = :isCollaborative", { isCollaborative })
    }

    // Apply sorting
    queryBuilder.orderBy(`playlist.${sortBy}`, sortOrder)

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    const [playlists, total] = await queryBuilder.getManyAndCount()

    return {
      playlists,
      total,
      page,
      limit,
    }
  }

  async findOne(id: string, userId?: string): Promise<Playlist> {
    const queryBuilder = this.createBaseQuery().where("playlist.id = :id", { id })

    const playlist = await queryBuilder.getOne()

    if (!playlist) {
      throw new NotFoundException("Playlist not found")
    }

    // Check access permissions
    await this.checkPlaylistAccess(playlist, userId)

    return playlist
  }

  async findByShareToken(shareToken: string): Promise<Playlist> {
    const playlist = await this.createBaseQuery().where("playlist.shareToken = :shareToken", { shareToken }).getOne()

    if (!playlist) {
      throw new NotFoundException("Playlist not found")
    }

    // Shared playlists can be accessed by anyone with the token
    // but private playlists still require the token
    if (playlist.privacy === PlaylistPrivacy.PRIVATE) {
      throw new ForbiddenException("This playlist is private")
    }

    return playlist
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto, userId: string): Promise<Playlist> {
    const playlist = await this.findOne(id, userId)

    // Check if user can edit
    await this.checkEditPermission(playlist, userId)

    // If changing to smart playlist or updating criteria, regenerate tracks
    const wasManual = playlist.type === PlaylistType.MANUAL
    const isBecomingSmart = updatePlaylistDto.type === PlaylistType.SMART
    const criteriaChanged =
      updatePlaylistDto.smartCriteria &&
      JSON.stringify(updatePlaylistDto.smartCriteria) !== JSON.stringify(playlist.smartCriteria)

    await this.playlistRepository.update(id, updatePlaylistDto)

    if ((wasManual && isBecomingSmart) || criteriaChanged) {
      await this.smartPlaylistService.updateSmartPlaylist(id)
    }

    return this.findOne(id, userId)
  }

  async remove(id: string, userId: string): Promise<void> {
    const playlist = await this.findOne(id, userId)

    // Only owner can delete
    if (playlist.createdById !== userId) {
      throw new ForbiddenException("Only the playlist owner can delete it")
    }

    await this.playlistRepository.remove(playlist)
  }

  async addTrack(playlistId: string, addTrackDto: AddTrackDto, userId: string): Promise<PlaylistTrack> {
    const playlist = await this.findOne(playlistId, userId)

    // Check if user can edit
    await this.checkEditPermission(playlist, userId)

    // Check if it's a manual playlist
    if (playlist.type === PlaylistType.SMART) {
      throw new BadRequestException("Cannot manually add tracks to smart playlists")
    }

    // Check if track exists
    const track = await this.trackRepository.findOne({
      where: { id: addTrackDto.trackId },
    })

    if (!track) {
      throw new NotFoundException("Track not found")
    }

    // Check if track is already in playlist
    const existingTrack = await this.playlistTrackRepository.findOne({
      where: {
        playlistId,
        trackId: addTrackDto.trackId,
      },
    })

    if (existingTrack) {
      throw new ConflictException("Track is already in the playlist")
    }

    // Determine position
    let position = addTrackDto.position
    if (position === undefined) {
      const lastTrack = await this.playlistTrackRepository.findOne({
        where: { playlistId },
        order: { position: "DESC" },
      })
      position = lastTrack ? lastTrack.position + 1 : 0
    } else {
      // Shift existing tracks if inserting at specific position
      await this.playlistTrackRepository
        .createQueryBuilder()
        .update()
        .set({ position: () => "position + 1" })
        .where("playlistId = :playlistId AND position >= :position", {
          playlistId,
          position,
        })
        .execute()
    }

    const playlistTrack = this.playlistTrackRepository.create({
      playlistId,
      trackId: addTrackDto.trackId,
      position,
      addedById: userId,
    })

    const savedTrack = await this.playlistTrackRepository.save(playlistTrack)

    // Update playlist stats
    await this.updatePlaylistStats(playlistId)

    return this.playlistTrackRepository.findOne({
      where: { id: savedTrack.id },
      relations: ["track", "addedBy"],
    })
  }

  async removeTrack(playlistId: string, trackId: string, userId: string): Promise<void> {
    const playlist = await this.findOne(playlistId, userId)

    // Check if user can edit
    await this.checkEditPermission(playlist, userId)

    if (playlist.type === PlaylistType.SMART) {
      throw new BadRequestException("Cannot manually remove tracks from smart playlists")
    }

    const playlistTrack = await this.playlistTrackRepository.findOne({
      where: { playlistId, trackId },
    })

    if (!playlistTrack) {
      throw new NotFoundException("Track not found in playlist")
    }

    await this.playlistTrackRepository.remove(playlistTrack)

    // Reorder remaining tracks
    await this.playlistTrackRepository
      .createQueryBuilder()
      .update()
      .set({ position: () => "position - 1" })
      .where("playlistId = :playlistId AND position > :position", {
        playlistId,
        position: playlistTrack.position,
      })
      .execute()

    // Update playlist stats
    await this.updatePlaylistStats(playlistId)
  }

  async reorderTracks(playlistId: string, trackIds: string[], userId: string): Promise<void> {
    const playlist = await this.findOne(playlistId, userId)

    // Check if user can edit
    await this.checkEditPermission(playlist, userId)

    if (playlist.type === PlaylistType.SMART) {
      throw new BadRequestException("Cannot reorder tracks in smart playlists")
    }

    // Update positions
    for (let i = 0; i < trackIds.length; i++) {
      await this.playlistTrackRepository.update({ playlistId, trackId: trackIds[i] }, { position: i })
    }
  }

  async addCollaborator(
    playlistId: string,
    addCollaboratorDto: AddCollaboratorDto,
    userId: string,
  ): Promise<PlaylistCollaborator> {
    const playlist = await this.findOne(playlistId, userId)

    // Only owner can add collaborators
    if (playlist.createdById !== userId) {
      throw new ForbiddenException("Only the playlist owner can add collaborators")
    }

    if (!playlist.isCollaborative) {
      throw new BadRequestException("Playlist is not collaborative")
    }

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: addCollaboratorDto.userId },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Check if already a collaborator
    const existing = await this.collaboratorRepository.findOne({
      where: {
        playlistId,
        userId: addCollaboratorDto.userId,
      },
    })

    if (existing) {
      throw new ConflictException("User is already a collaborator")
    }

    const collaborator = this.collaboratorRepository.create({
      playlistId,
      userId: addCollaboratorDto.userId,
      role: addCollaboratorDto.role || CollaboratorRole.EDITOR,
      invitedById: userId,
    })

    return this.collaboratorRepository.save(collaborator)
  }

  async removeCollaborator(playlistId: string, collaboratorId: string, userId: string): Promise<void> {
    const playlist = await this.findOne(playlistId, userId)

    const collaborator = await this.collaboratorRepository.findOne({
      where: { id: collaboratorId, playlistId },
    })

    if (!collaborator) {
      throw new NotFoundException("Collaborator not found")
    }

    // Owner can remove anyone, collaborators can remove themselves
    if (playlist.createdById !== userId && collaborator.userId !== userId) {
      throw new ForbiddenException("Insufficient permissions")
    }

    await this.collaboratorRepository.remove(collaborator)
  }

  async followPlaylist(playlistId: string, userId: string): Promise<PlaylistFollow> {
    const playlist = await this.findOne(playlistId, userId)

    // Check if already following
    const existing = await this.followRepository.findOne({
      where: { playlistId, userId },
    })

    if (existing) {
      throw new ConflictException("Already following this playlist")
    }

    const follow = this.followRepository.create({
      playlistId,
      userId,
    })

    const savedFollow = await this.followRepository.save(follow)

    // Update followers count
    await this.playlistRepository.increment({ id: playlistId }, "followersCount", 1)

    return savedFollow
  }

  async unfollowPlaylist(playlistId: string, userId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { playlistId, userId },
    })

    if (!follow) {
      throw new NotFoundException("Not following this playlist")
    }

    await this.followRepository.remove(follow)

    // Update followers count
    await this.playlistRepository.decrement({ id: playlistId }, "followersCount", 1)
  }

  async getUserPlaylists(
    userId: string,
    query: PlaylistQueryDto,
  ): Promise<{
    playlists: Playlist[]
    total: number
    page: number
    limit: number
  }> {
    return this.findAll({ ...query, createdBy: userId }, userId)
  }

  async getFollowedPlaylists(
    userId: string,
    query: PlaylistQueryDto,
  ): Promise<{
    playlists: Playlist[]
    total: number
    page: number
    limit: number
  }> {
    const { page = 1, limit = 20 } = query

    const queryBuilder = this.playlistRepository
      .createQueryBuilder("playlist")
      .leftJoinAndSelect("playlist.createdBy", "creator")
      .innerJoin("playlist.followers", "follow", "follow.userId = :userId", { userId })
      .orderBy("follow.followedAt", "DESC")

    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    const [playlists, total] = await queryBuilder.getManyAndCount()

    return {
      playlists,
      total,
      page,
      limit,
    }
  }

  async incrementPlayCount(playlistId: string): Promise<void> {
    await this.playlistRepository.increment({ id: playlistId }, "playsCount", 1)
  }

  private createBaseQuery(): SelectQueryBuilder<Playlist> {
    return this.playlistRepository
      .createQueryBuilder("playlist")
      .leftJoinAndSelect("playlist.createdBy", "creator")
      .leftJoinAndSelect("playlist.playlistTracks", "playlistTracks")
      .leftJoinAndSelect("playlistTracks.track", "track")
      .leftJoinAndSelect("track.artist", "artist")
      .leftJoinAndSelect("playlist.collaborators", "collaborators")
      .leftJoinAndSelect("collaborators.user", "collaboratorUser")
      .orderBy("playlistTracks.position", "ASC")
  }

  private async checkPlaylistAccess(playlist: Playlist, userId?: string): Promise<void> {
    if (playlist.privacy === PlaylistPrivacy.PUBLIC) {
      return // Public playlists are accessible to everyone
    }

    if (!userId) {
      throw new ForbiddenException("Authentication required")
    }

    if (playlist.privacy === PlaylistPrivacy.PRIVATE) {
      // Private playlists are only accessible to owner and collaborators
      if (playlist.createdById === userId) {
        return
      }

      const isCollaborator = playlist.collaborators?.some((collab) => collab.userId === userId)

      if (!isCollaborator) {
        throw new ForbiddenException("Access denied")
      }
    }

    // Unlisted playlists are accessible to anyone with the link (handled in controller)
  }

  private async checkEditPermission(playlist: Playlist, userId: string): Promise<void> {
    // Owner can always edit
    if (playlist.createdById === userId) {
      return
    }

    // Check if user is a collaborator with edit permissions
    if (playlist.isCollaborative) {
      const collaborator = playlist.collaborators?.find((collab) => collab.userId === userId)

      if (collaborator && collaborator.role === CollaboratorRole.EDITOR) {
        return
      }
    }

    throw new ForbiddenException("Insufficient permissions to edit this playlist")
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
