import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MulterModule } from "@nestjs/platform-express"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { VideoController } from "./controllers/video.controller"
import { VideoService } from "./services/video.service"
import { VideoProcessingService } from "./services/video-processing.service"
import { VideoAnalyticsService } from "./services/video-analytics.service"
import { VideoSEOService } from "./services/video-seo.service"
import { Video } from "./entities/video.entity"
import { VideoQuality } from "./entities/video-quality.entity"
import { VideoView } from "./entities/video-view.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, VideoQuality, VideoView]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get<number>("MAX_VIDEO_SIZE", 500 * 1024 * 1024), // 500MB default
        },
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.startsWith("video/")) {
            return callback(new Error("Only video files are allowed"), false)
          }
          callback(null, true)
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoProcessingService, VideoAnalyticsService, VideoSEOService],
  exports: [VideoService, VideoAnalyticsService],
})
export class VideoModule {}
