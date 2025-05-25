import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StreamingSessionService } from '../services/streaming-session.service';
import { DownloadService } from '../services/download.service';
import { StreamingHistoryService } from '../services/streaming-history.service';
import { PlaybackService } from '../services/playback.service';
import { CreateStreamingSessionDto, UpdateStreamingSessionDto } from '../dto/create-streaming-session.dto';
import { CreateDownloadRequestDto } from '../dto/download-request.dto';
import { PlaybackSettingsDto } from '../dto/playback-settings.dto';

@Controller('streaming')
@UseGuards(JwtAuthGuard)
export class StreamingController {
  constructor(
    private readonly streamingSessionService: StreamingSessionService,
    private readonly downloadService: DownloadService,
    private readonly historyService: StreamingHistoryService,
    private readonly playbackService: PlaybackService,
  ) {}

  @Post('sessions')
  async createSession(
    createSessionDto: CreateStreamingSessionDto,
    @Req() req: any
  ) {
    return this.streamingSessionService.createSession(
      req.user.id,
      createSessionDto,
      req
    );
  }

  @Put('sessions/:id')
  async updateSession(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() updateSessionDto: UpdateStreamingSessionDto
  ) {
    return this.streamingSessionService.updateSession(sessionId, updateSessionDto);
  }

  @Post('sessions/:id/end')
  async endSession(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() body: { duration: number; bytesStreamed: number }
  ) {
    return this.streamingSessionService.endSession(
      sessionId,
      body.duration,
      body.bytesStreamed
    );
  }

  @Get('sessions/active')
  async getActiveSessions(@Req() req: any) {
    return this.streamingSessionService.getUserActiveSessions(req.user.id);
  }

  @Get('analytics')
  async getAnalytics(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    return this.streamingSessionService.getSessionAnalytics(req.user.id, start, end);
  }

  @Post('downloads')
  async createDownload(
    @Body() createDownloadDto: CreateDownloadRequestDto,
    @Req() req: any
  ) {
    return this.downloadService.createDownloadRequest(req.user.id, createDownloadDto);
  }

  @Get('downloads')
  async getUserDownloads(@Req() req: any) {
    return this.downloadService.getUserDownloads(req.user.id);
  }

  @Get('downloads/active')
  async getActiveDownloads(@Req() req: any) {
    return this.downloadService.getActiveDownloads(req.user.id);
  }

  @Delete('downloads/:id')
  async deleteDownload(
    @Param('id', ParseUUIDPipe) downloadId: string,
    @Req() req: any
  ) {
    return this.downloadService.deleteDownload(req.user.id, downloadId);
  }

  @Get('history')
  async getHistory(
    @Req() req: any,
    @Query('limit', ParseIntPipe) limit: number = 50,
    @Query('offset', ParseIntPipe) offset: number = 0
  ) {
    return this.historyService.getUserHistory(req.user.id, limit, offset);
  }

  @Get('history/recent')
  async getRecentlyPlayed(
    @Req() req: any,
    @Query('limit', ParseIntPipe) limit: number = 20
  ) {
    return this.historyService.getRecentlyPlayed(req.user.id, limit);
  }

  @Get('history/top-tracks')
  async getTopTracks(
    @Req() req: any,
    @Query('timeframe') timeframe: 'week' | 'month' | 'year' = 'month',
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.historyService.getMostPlayedTracks(req.user.id, timeframe, limit);
  }

  @Get('history/stats')
  async getListeningStats(
    @Req() req: any,
    @Query('timeframe') timeframe: 'week' | 'month' | 'year' = 'month'
  ) {
    return this.historyService.getListeningStats(req.user.id, timeframe);
  }

  @Delete('history')
  async clearHistory(
    @Req() req: any,
    @Query('olderThan') olderThan?: string
  ) {
    const date = olderThan ? new Date(olderThan) : undefined;
    return this.historyService.clearUserHistory(req.user.id, date);
  }

  @Get('playback/settings')
  async getPlaybackSettings(@Req() req: any) {
    return this.playbackService.getPlaybackSettings(req.user.id);
  }

  @Put('playback/settings')
  async updatePlaybackSettings(
    @Body() settings: PlaybackSettingsDto,
    @Req() req: any
  ) {
    return this.playbackService.updatePlaybackSettings(req.user.id, settings);
  }

  @Get('bandwidth/optimize')
  async getBandwidthOptimization(
    @Req() req: any,
    @Query('speed', ParseIntPipe) connectionSpeed: number
  ) {
    const recommendedQuality = await this.streamingSessionService.getBandwidthOptimization(
      req.user.id,
      connectionSpeed
    );
    return { recommendedQuality };
  }
}
