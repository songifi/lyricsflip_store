import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, SelectQueryBuilder } from "typeorm"
import { Video, VideoStatus } from "../entities/video.entity"
import { VideoQuality } from "../entities/video-quality.entity"
import type { CreateVideoDto } from "../dto/create-video.dto"
import type { UpdateVideoDto } from "../dto/update-video.dto"
import type { VideoQueryDto } from "../dto/video-query.dto"
import type { VideoProcessingService } from "./video-processing.service"
import type { VideoAnalyticsService } from "./video-analytics.service"
import type { Express } from "express"

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly videoRepository: Repository<Video>,
    private readonly videoQualityRepository: Repository<VideoQuality>,
    private readonly videoProcessingService: VideoProcessingService,
    private readonly videoAnalyticsService: VideoAnalyticsService,
    @InjectRepository(Video)
    @InjectRepository(VideoQuality)
  ) {}

  async create(createVideoDto: CreateVideoDto, uploadedById: string): Promise<Video> {
    const video = this.videoRepository.create({
      ...createVideoDto,
      uploadedById,
      status: VideoStatus.UPLOADING,
    })

    return await this.videoRepository.save(video)
  }

  async findAll(query: VideoQueryDto) {
    const { page, limit, sortBy, sortOrder, ...filters } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.createQueryBuilder(filters)

    // Add sorting
    queryBuilder.orderBy(`video.${sortBy}`, sortOrder)

    // Add pagination
    queryBuilder.skip(skip).take(limit)

    const [videos, total] = await queryBuilder.getManyAndCount()

    return {
      data: videos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ["track", "artist", "uploadedBy", "qualities"],
    })

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`)
    }

    return video
  }

  async findByTrack(trackId: string): Promise<Video[]> {
    return await this.videoRepository.find({
      where: { trackId, status: VideoStatus.READY, isPublic: true },
      relations: ["artist", "qualities"],
      order: { createdAt: "DESC" },
    })
  }

  async findByArtist(artistId: string, query: VideoQueryDto): Promise<any> {
    const modifiedQuery = { ...query, artistId }
    return await this.findAll(modifiedQuery)
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id)

    Object.assign(video, updateVideoDto)

    if (updateVideoDto.status === VideoStatus.READY && !video.publishedAt) {
      video.publishedAt = new Date()
    }

    return await this.videoRepository.save(video)
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id)

    // Clean up files
    await this.videoProcessingService.cleanupVideoFiles(video)

    await this.videoRepository.remove(video)
  }

  async uploadVideo(videoId: string, file: Express.Multer.File): Promise<Video> {
    const video = await this.findOne(videoId)

    if (video.status !== VideoStatus.UPLOADING) {
      throw new BadRequestException("Video is not in uploading state")
    }

    try {
      // Save original file
      const filePath = await this.videoProcessingService.saveOriginalFile(file, videoId)
      video.originalFilePath = filePath
      video.status = VideoStatus.PROCESSING

      await this.videoRepository.save(video)

      // Start background processing
      this.videoProcessingService.processVideo(video).catch((error) => {
        this.logger.error(`Video processing failed for ${videoId}:`, error)
        this.updateVideoStatus(videoId, VideoStatus.FAILED)
      })

      return video
    } catch (error) {
      this.logger.error(`Video upload failed for ${videoId}:`, error)
      video.status = VideoStatus.FAILED
      await this.videoRepository.save(video)
      throw error
    }
  }

  async getVideoStream(
    videoId: string,
    quality?: string,
  ): Promise<{
    video: Video
    streamUrl: string
    qualities: VideoQuality[]
  }> {
    const video = await this.findOne(videoId)

    if (video.status !== VideoStatus.READY) {
      throw new BadRequestException("Video is not ready for streaming")
    }

    const qualities = await this.videoQualityRepository.find({
      where: { videoId, isReady: true },
      order: { bitRate: "DESC" },
    })

    if (qualities.length === 0) {
      throw new NotFoundException("No video qualities available")
    }

    let selectedQuality = qualities[0] // Default to highest quality

    if (quality) {
      const requestedQuality = qualities.find((q) => q.quality === quality)
      if (requestedQuality) {
        selectedQuality = requestedQuality
      }
    }

    return {
      video,
      streamUrl: selectedQuality.fileUrl,
      qualities,
    }
  }

  async incrementViewCount(videoId: string, userId?: string, ipAddress?: string): Promise<void> {
    await this.videoAnalyticsService.recordView(videoId, userId, ipAddress)

    // Update video view count
    await this.videoRepository.increment({ id: videoId }, "viewCount", 1)
  }

  async getFeaturedVideos(limit = 10): Promise<Video[]> {
    return await this.videoRepository.find({
      where: {
        isFeatured: true,
        status: VideoStatus.READY,
        isPublic: true,
      },
      relations: ["artist", "track"],
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getTrendingVideos(limit = 10): Promise<Video[]> {
    return await this.videoRepository
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.artist", "artist")
      .leftJoinAndSelect("video.track", "track")
      .where("video.status = :status", { status: VideoStatus.READY })
      .andWhere("video.isPublic = :isPublic", { isPublic: true })
      .andWhere("video.createdAt >= :date", {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      })
      .orderBy("video.viewCount", "DESC")
      .addOrderBy("video.createdAt", "DESC")
      .take(limit)
      .getMany()
  }

  private async updateVideoStatus(videoId: string, status: VideoStatus): Promise<void> {
    await this.videoRepository.update(videoId, { status })
  }

  private createQueryBuilder(filters: Partial<VideoQueryDto>): SelectQueryBuilder<Video> {
    const queryBuilder = this.videoRepository
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.artist", "artist")
      .leftJoinAndSelect("video.track", "track")
      .leftJoinAndSelect("video.uploadedBy", "uploadedBy")

    // Apply filters
    if (filters.type) {
      queryBuilder.andWhere("video.type = :type", { type: filters.type })
    }

    if (filters.status) {
      queryBuilder.andWhere("video.status = :status", { status: filters.status })
    }

    if (filters.artistId) {
      queryBuilder.andWhere("video.artistId = :artistId", { artistId: filters.artistId })
    }

    if (filters.trackId) {
      queryBuilder.andWhere("video.trackId = :trackId", { trackId: filters.trackId })
    }

    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere("video.isPublic = :isPublic", { isPublic: filters.isPublic })
    }

    if (filters.isFeatured !== undefined) {
      queryBuilder.andWhere("video.isFeatured = :isFeatured", { isFeatured: filters.isFeatured })
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(video.title ILIKE :search OR video.description ILIKE :search OR video.tags::text ILIKE :search)",
        { search: `%${filters.search}%` },
      )
    }

    return queryBuilder
  }
}
