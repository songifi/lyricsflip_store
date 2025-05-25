import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from "@nestjs/swagger"
import type { Request, Response } from "express"
import type { VideoService } from "../services/video.service"
import type { VideoAnalyticsService } from "../services/video-analytics.service"
import type { VideoSEOService } from "../services/video-seo.service"
import type { CreateVideoDto } from "../dto/create-video.dto"
import type { UpdateVideoDto } from "../dto/update-video.dto"
import type { VideoQueryDto } from "../dto/video-query.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { GetUser } from "../../auth/decorators/get-user.decorator"
import type { User } from "../../users/entities/user.entity"

@ApiTags("videos")
@Controller("videos")
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly videoAnalyticsService: VideoAnalyticsService,
    private readonly videoSEOService: VideoSEOService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new video" })
  @ApiResponse({ status: 201, description: "Video created successfully" })
  async create(createVideoDto: CreateVideoDto, @GetUser() user: User) {
    return await this.videoService.create(createVideoDto, user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async findAll(@Query() query: VideoQueryDto) {
    return await this.videoService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured videos' })
  @ApiResponse({ status: 200, description: 'Featured videos retrieved successfully' })
  async getFeatured(@Query('limit') limit: number = 10) {
    return await this.videoService.getFeaturedVideos(limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending videos' })
  @ApiResponse({ status: 200, description: 'Trending videos retrieved successfully' })
  async getTrending(@Query('limit') limit: number = 10) {
    return await this.videoService.getTrendingVideos(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video by ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async findOne(@Param('id') id: string) {
    return await this.videoService.findOne(id);
  }

  @Get(":id/stream")
  @ApiOperation({ summary: "Get video stream URL and qualities" })
  @ApiResponse({ status: 200, description: "Video stream data retrieved successfully" })
  async getStream(@Param('id') id: string, @Query('quality') quality?: string, @Req() req: Request) {
    const streamData = await this.videoService.getVideoStream(id, quality)

    // Record view
    const userId = req.user?.["id"]
    const ipAddress = req.ip || req.connection.remoteAddress

    await this.videoService.incrementViewCount(id, userId, ipAddress)

    return streamData
  }

  @Post(":id/upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("video"))
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload video file" })
  @ApiResponse({ status: 200, description: "Video uploaded successfully" })
  async uploadVideo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return await this.videoService.uploadVideo(id, file)
  }

  @Post(":id/view")
  @ApiOperation({ summary: "Record a video view" })
  @ApiResponse({ status: 200, description: "View recorded successfully" })
  async recordView(
    @Param('id') id: string,
    @Body() viewData: { watchDuration?: number; completionPercentage?: number },
    @Req() req: Request,
  ) {
    const userId = req.user?.["id"]
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.headers["user-agent"]

    return await this.videoAnalyticsService.recordView(
      id,
      userId,
      ipAddress,
      userAgent,
      viewData.watchDuration,
      viewData.completionPercentage,
    )
  }

  @Get(":id/analytics")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get video analytics" })
  @ApiResponse({ status: 200, description: "Analytics retrieved successfully" })
  async getAnalytics(@Param('id') id: string, @Query('days') days: number = 30) {
    return await this.videoAnalyticsService.getVideoAnalytics(id, days)
  }

  @Get(':id/seo')
  @ApiOperation({ summary: 'Get video SEO data' })
  @ApiResponse({ status: 200, description: 'SEO data retrieved successfully' })
  async getSEOData(@Param('id') id: string) {
    return await this.videoSEOService.generateSEOData(id);
  }

  @Get('track/:trackId')
  @ApiOperation({ summary: 'Get videos for a specific track' })
  @ApiResponse({ status: 200, description: 'Track videos retrieved successfully' })
  async getVideosByTrack(@Param('trackId') trackId: string) {
    return await this.videoService.findByTrack(trackId);
  }

  @Get("artist/:artistId")
  @ApiOperation({ summary: "Get videos for a specific artist" })
  @ApiResponse({ status: 200, description: "Artist videos retrieved successfully" })
  async getVideosByArtist(@Param('artistId') artistId: string, @Query() query: VideoQueryDto) {
    return await this.videoService.findByArtist(artistId, query)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a video" })
  @ApiResponse({ status: 200, description: "Video updated successfully" })
  async update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return await this.videoService.update(id, updateVideoDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.videoService.remove(id);
    return { message: 'Video deleted successfully' };
  }

  @Get(":id/embed")
  @ApiOperation({ summary: "Get embeddable video player" })
  @ApiResponse({ status: 200, description: "Embed player HTML" })
  async getEmbedPlayer(
    @Param('id') id: string,
    @Query('autoplay') autoplay: boolean = false,
    @Query('controls') controls: boolean = true,
    @Res() res: Response,
  ) {
    const video = await this.videoService.findOne(id)
    const streamData = await this.videoService.getVideoStream(id)

    const embedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${video.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; background: #000; }
          video { width: 100%; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <video 
          ${controls ? "controls" : ""} 
          ${autoplay ? "autoplay" : ""} 
          poster="${video.thumbnailUrl}"
        >
          <source src="${streamData.streamUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </body>
      </html>
    `

    res.setHeader("Content-Type", "text/html")
    res.status(HttpStatus.OK).send(embedHtml)
  }
}
