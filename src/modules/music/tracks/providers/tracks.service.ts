import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, SelectQueryBuilder } from "typeorm"
import { CreateTrackDto } from "../dto/create-track.dto"
import { UpdateTrackDto } from "../dto/update-track.dto"
import { TrackQueryDto } from "../dto/track-query.dto"
import { Express } from "express"
import { Track } from "../entities/track.entity"
import { AudioProcessingService } from "./audio-processing.service"
import { FileUploadService } from "src/common/services/file-upload.service"
import { TrackStatus } from "../enums/trackStatus.enum"

@Injectable()
export class TracksService {
  private readonly logger = new Logger(TracksService.name);

  constructor(
    private readonly audioProcessingService: AudioProcessingService,
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
  ) {}

  async create(createTrackDto: CreateTrackDto, audioFile: Express.Multer.File): Promise<Track> {
    try {
      // Validate audio file
      await this.validateAudioFile(audioFile)

      // Extract audio metadata
      const metadata = await this.audioProcessingService.extractMetadata(audioFile.buffer)

      // Upload original audio file
      const audioUploadResult = await this.fileUploadService.uploadAudio(audioFile, `tracks/${createTrackDto.artistId}`)

      // Create track entity
      const track = this.trackRepository.create({
        ...createTrackDto,
        credits: createTrackDto.credits
          ? { ...createTrackDto.credits }
          : undefined,
        audioFileUrl: audioUploadResult.url,
        audioFileKey: audioUploadResult.key,
        duration: metadata.duration,
        bitrate: metadata.bitrate,
        sampleRate: metadata.sampleRate,
        format: metadata.format,
        fileSize: audioFile.size,
        checksum: await this.audioProcessingService.generateChecksum(audioFile.buffer),
        processingStatus: {
          audioProcessed: true,
          previewGenerated: false,
          waveformGenerated: false,
          metadataExtracted: true,
        },
      })

      const savedTrack = await this.trackRepository.save(track)

      // Process audio asynchronously
      this.processAudioAsync(savedTrack.id, audioFile.buffer)

      return savedTrack
    } catch (error) {
      this.logger.error(`Failed to create track: ${error.message}`, error.stack)
      throw new BadRequestException("Failed to create track")
    }
  }

  async findAll(query: TrackQueryDto): Promise<{
    tracks: Track[]
    total: number
    page: number
    limit: number
  }> {
    const queryBuilder = this.createQueryBuilder(query)

    const page = query.page ?? 1
    const limit = query.limit ?? 10

    const [tracks, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      tracks,
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: ["artist", "album", "genre"],
    })

    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`)
    }

    return track
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    const track = await this.findOne(id)

    Object.assign(track, updateTrackDto)
    return this.trackRepository.save(track)
  }

  async remove(id: string): Promise<void> {
    const track = await this.findOne(id)

    // Delete associated files
    await this.fileUploadService.deleteFile(track.audioFileKey)
    if (track.previewKey) {
      await this.fileUploadService.deleteFile(track.previewKey)
    }

    await this.trackRepository.remove(track)
  }

  async incrementPlayCount(id: string): Promise<void> {
    await this.trackRepository.increment({ id }, "playCount", 1)
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.trackRepository.increment({ id }, "downloadCount", 1)
  }

  async updateStatus(id: string, status: TrackStatus): Promise<Track> {
    const track = await this.findOne(id)
    track.status = status
    return this.trackRepository.save(track)
  }

  async generatePreview(id: string): Promise<Track> {
    const track = await this.findOne(id)

    if (track.previewUrl) {
      return track // Preview already exists
    }

    try {
      // Download original audio file
      const audioBuffer = await this.fileUploadService.downloadFile(track.audioFileKey)

      // Generate preview (30 seconds from the middle)
      const previewBuffer = await this.audioProcessingService.generatePreview(audioBuffer, 30)

      // Upload preview
      const previewUploadResult = await this.fileUploadService.uploadAudio(
        {
          buffer: previewBuffer,
          originalname: `${track.title}_preview.mp3`,
          mimetype: "audio/mpeg",
        } as Express.Multer.File,
        `tracks/${track.artistId}/previews`,
      )

      // Update track
      track.previewUrl = previewUploadResult.url
      track.previewKey = previewUploadResult.key
      track.processingStatus = {
        ...track.processingStatus,
        previewGenerated: true,
      }

      return this.trackRepository.save(track)
    } catch (error) {
      this.logger.error(`Failed to generate preview for track ${id}: ${error.message}`, error.stack)
      throw new BadRequestException("Failed to generate preview")
    }
  }

  async generateWaveform(id: string): Promise<Track> {
    const track = await this.findOne(id)

    if (track.waveformUrl) {
      return track // Waveform already exists
    }

    try {
      // Download original audio file
      const audioBuffer = await this.fileUploadService.downloadFile(track.audioFileKey)

      // Generate waveform data
      const waveformData = await this.audioProcessingService.generateWaveform(audioBuffer)

      // Upload waveform as JSON
      const waveformUploadResult = await this.fileUploadService.uploadFile(
        {
          buffer: Buffer.from(JSON.stringify(waveformData)),
          originalname: `${track.title}_waveform.json`,
          mimetype: "application/json",
        } as Express.Multer.File,
        `tracks/${track.artistId}/waveforms`,
      )

      // Update track
      track.waveformUrl = waveformUploadResult.url
      track.processingStatus = {
        ...track.processingStatus,
        waveformGenerated: true,
      }

      return this.trackRepository.save(track)
    } catch (error) {
      this.logger.error(`Failed to generate waveform for track ${id}: ${error.message}`, error.stack)
      throw new BadRequestException("Failed to generate waveform")
    }
  }

  private createQueryBuilder(query: TrackQueryDto): SelectQueryBuilder<Track> {
    const queryBuilder = this.trackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.artist", "artist")
      .leftJoinAndSelect("track.album", "album")
      .leftJoinAndSelect("track.genre", "genre")

    if (query.search) {
      queryBuilder.andWhere("(track.title ILIKE :search OR artist.name ILIKE :search)", { search: `%${query.search}%` })
    }

    if (query.artistId) {
      queryBuilder.andWhere("track.artistId = :artistId", {
        artistId: query.artistId,
      })
    }

    if (query.albumId) {
      queryBuilder.andWhere("track.albumId = :albumId", {
        albumId: query.albumId,
      })
    }

    if (query.genreId) {
      queryBuilder.andWhere("track.genreId = :genreId", {
        genreId: query.genreId,
      })
    }

    if (query.status) {
      queryBuilder.andWhere("track.status = :status", { status: query.status })
    }

    if (query.format) {
      queryBuilder.andWhere("track.format = :format", { format: query.format })
    }

    if (query.isExplicit !== undefined) {
      queryBuilder.andWhere("track.isExplicit = :isExplicit", {
        isExplicit: query.isExplicit,
      })
    }

    if (query.allowDownload !== undefined) {
      queryBuilder.andWhere("track.allowDownload = :allowDownload", {
        allowDownload: query.allowDownload,
      })
    }

    queryBuilder.orderBy(`track.${query.sortBy}`, query.sortOrder)

    return queryBuilder
  }

  private async validateAudioFile(file: Express.Multer.File): Promise<void> {
    const allowedMimeTypes = ["audio/mpeg", "audio/wav", "audio/flac", "audio/aac", "audio/ogg"]

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Invalid audio file format")
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException("Audio file too large (max 100MB)")
    }
  }

  private async processAudioAsync(trackId: string, audioBuffer: Buffer): Promise<void> {
    try {
      // Generate preview
      await this.generatePreview(trackId)

      // Generate waveform
      await this.generateWaveform(trackId)

      this.logger.log(`Audio processing completed for track ${trackId}`)
    } catch (error) {
      this.logger.error(`Audio processing failed for track ${trackId}: ${error.message}`, error.stack)

      // Update processing status with error
      await this.trackRepository.update(trackId, {
        processingStatus: {
          audioProcessed: true,
          previewGenerated: false,
          waveformGenerated: false,
          metadataExtracted: true,
          errors: [error.message],
        },
      })
    }
  }
}
