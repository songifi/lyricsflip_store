import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import type { ConfigService } from "@nestjs/config"
import * as ffmpeg from "fluent-ffmpeg"
import * as path from "path"
import * as fs from "fs/promises"
import { Video, VideoStatus } from "../entities/video.entity"
import { VideoQuality, QualityLevel } from "../entities/video-quality.entity"
import type { Express } from "express"

interface QualityConfig {
  quality: QualityLevel
  resolution: string
  bitRate: number
  scale: string
}

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name)
  private readonly uploadPath: string
  private readonly processedPath: string
  private readonly thumbnailPath: string

  private readonly qualityConfigs: QualityConfig[] = [
    {
      quality: QualityLevel.LOW,
      resolution: "640x360",
      bitRate: 800,
      scale: "640:360",
    },
    {
      quality: QualityLevel.MEDIUM,
      resolution: "854x480",
      bitRate: 1200,
      scale: "854:480",
    },
    {
      quality: QualityLevel.HIGH,
      resolution: "1280x720",
      bitRate: 2500,
      scale: "1280:720",
    },
    {
      quality: QualityLevel.FULL_HD,
      resolution: "1920x1080",
      bitRate: 5000,
      scale: "1920:1080",
    },
  ];

  constructor(
    private readonly videoRepository: Repository<Video>,
    private readonly videoQualityRepository: Repository<VideoQuality>,
    private readonly configService: ConfigService,
    @InjectRepository(Video)
    @InjectRepository(VideoQuality)
  ) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    this.processedPath = this.configService.get<string>('PROCESSED_PATH', './processed');
    this.thumbnailPath = this.configService.get<string>('THUMBNAIL_PATH', './thumbnails');
    
    this.ensureDirectories();
  }

  async saveOriginalFile(file: Express.Multer.File, videoId: string): Promise<string> {
    const fileName = `${videoId}_original${path.extname(file.originalname)}`
    const filePath = path.join(this.uploadPath, fileName)

    await fs.writeFile(filePath, file.buffer)

    return filePath
  }

  async processVideo(video: Video): Promise<void> {
    try {
      this.logger.log(`Starting video processing for ${video.id}`)

      // Extract video metadata
      const metadata = await this.extractMetadata(video.originalFilePath)

      // Update video with metadata
      await this.updateVideoMetadata(video.id, metadata)

      // Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(video)

      // Process different quality versions
      const qualities = await this.processQualities(video)

      // Update video status to ready
      await this.videoRepository.update(video.id, {
        status: VideoStatus.READY,
        thumbnailUrl,
        publishedAt: new Date(),
      })

      this.logger.log(`Video processing completed for ${video.id}`)
    } catch (error) {
      this.logger.error(`Video processing failed for ${video.id}:`, error)
      await this.videoRepository.update(video.id, { status: VideoStatus.FAILED })
      throw error
    }
  }

  async generateThumbnail(video: Video): Promise<string> {
    return new Promise((resolve, reject) => {
      const thumbnailFileName = `${video.id}_thumbnail.jpg`
      const thumbnailPath = path.join(this.thumbnailPath, thumbnailFileName)

      ffmpeg(video.originalFilePath)
        .screenshots({
          timestamps: ["10%", "25%", "50%"],
          filename: `${video.id}_thumb_%i.jpg`,
          folder: this.thumbnailPath,
          size: "1280x720",
        })
        .on("end", () => {
          const thumbnailUrl = `/thumbnails/${video.id}_thumb_2.jpg` // Use middle thumbnail
          resolve(thumbnailUrl)
        })
        .on("error", (error) => {
          this.logger.error(`Thumbnail generation failed for ${video.id}:`, error)
          reject(error)
        })
    })
  }

  private async processQualities(video: Video): Promise<VideoQuality[]> {
    const qualities: VideoQuality[] = []

    for (const config of this.qualityConfigs) {
      try {
        const quality = await this.processQuality(video, config)
        qualities.push(quality)
      } catch (error) {
        this.logger.warn(`Failed to process ${config.quality} for video ${video.id}:`, error)
      }
    }

    return qualities
  }

  private async processQuality(video: Video, config: QualityConfig): Promise<VideoQuality> {
    return new Promise(async (resolve, reject) => {
      const outputFileName = `${video.id}_${config.quality}.mp4`
      const outputPath = path.join(this.processedPath, outputFileName)

      ffmpeg(video.originalFilePath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .videoBitrate(config.bitRate)
        .size(config.resolution)
        .format("mp4")
        .output(outputPath)
        .on("end", async () => {
          try {
            const stats = await fs.stat(outputPath)

            const videoQuality = this.videoQualityRepository.create({
              videoId: video.id,
              quality: config.quality,
              filePath: outputPath,
              fileUrl: `/videos/${outputFileName}`,
              fileSize: stats.size,
              bitRate: config.bitRate,
              resolution: config.resolution,
              isReady: true,
            })

            const savedQuality = await this.videoQualityRepository.save(videoQuality)
            resolve(savedQuality)
          } catch (error) {
            reject(error)
          }
        })
        .on("error", (error) => {
          this.logger.error(`Quality processing failed for ${video.id} ${config.quality}:`, error)
          reject(error)
        })
        .run()
    })
  }

  private async extractMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          reject(error)
          return
        }

        const videoStream = metadata.streams.find((stream) => stream.codec_type === "video")
        const audioStream = metadata.streams.find((stream) => stream.codec_type === "audio")

        resolve({
          duration: Math.floor(metadata.format.duration),
          fileSize: metadata.format.size,
          resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : null,
          frameRate: videoStream ? eval(videoStream.r_frame_rate) : null,
          bitRate: videoStream ? videoStream.bit_rate : null,
          codec: videoStream ? videoStream.codec_name : null,
        })
      })
    })
  }

  private async updateVideoMetadata(videoId: string, metadata: any): Promise<void> {
    await this.videoRepository.update(videoId, metadata)
  }

  async cleanupVideoFiles(video: Video): Promise<void> {
    try {
      // Remove original file
      if (video.originalFilePath) {
        await fs.unlink(video.originalFilePath).catch(() => {})
      }

      // Remove quality files
      const qualities = await this.videoQualityRepository.find({
        where: { videoId: video.id },
      })

      for (const quality of qualities) {
        await fs.unlink(quality.filePath).catch(() => {})
      }

      // Remove thumbnails
      const thumbnailPattern = path.join(this.thumbnailPath, `${video.id}_*`)
      // Implementation would depend on your file system setup
    } catch (error) {
      this.logger.error(`Failed to cleanup files for video ${video.id}:`, error)
    }
  }

  private async ensureDirectories(): Promise<void> {
    const directories = [this.uploadPath, this.processedPath, this.thumbnailPath]

    for (const dir of directories) {
      try {
        await fs.access(dir)
      } catch {
        await fs.mkdir(dir, { recursive: true })
      }
    }
  }
}
