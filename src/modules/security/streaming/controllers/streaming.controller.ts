import { Controller, Get, Param, Query, Req, Res, UseGuards, HttpException, HttpStatus } from "@nestjs/common"
import type { Request, Response } from "express"
import { RateLimit, RateLimitConfigs } from "../../../common/decorators/rate-limit.decorator"
import { RateLimitGuard } from "../../../common/guards/rate-limit.guard"
import { ApiKeyGuard, RequireApiKeyScopes } from "../../../common/guards/api-key.guard"
import { ApiKeyScope } from "../../security/entities/api-key.entity"
import type { DrmService } from "../../security/services/drm.service"
import type { AbuseDetectionService } from "../../security/services/abuse-detection.service"
import type { SecurityMonitoringService } from "../../security/services/monitoring.service"

@Controller("streaming")
@UseGuards(RateLimitGuard, ApiKeyGuard)
export class StreamingController {
  constructor(
    private readonly drmService: DrmService,
    private readonly abuseDetectionService: AbuseDetectionService,
    private readonly monitoringService: SecurityMonitoringService,
  ) {}

  @Get("token/:trackId")
  @RateLimit(RateLimitConfigs.STREAMING)
  @RequireApiKeyScopes(ApiKeyScope.STREAM)
  async getStreamingToken(@Param('trackId') trackId: string, @Req() req: Request) {
    const userId = req.user?.id

    // Check for abuse
    const abuseResult = await this.abuseDetectionService.detectStreamingAbuse(userId, trackId)

    if (abuseResult.isAbusive) {
      await this.monitoringService.logSecurityEvent({
        type: "abuse_detected",
        userId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        endpoint: req.route.path,
        timestamp: new Date(),
        metadata: { trackId, abuseType: "streaming" },
      })

      throw new HttpException("Streaming abuse detected. Please try again later.", HttpStatus.TOO_MANY_REQUESTS)
    }

    // Validate content access
    if (!this.drmService.validateContentAccess(userId, trackId, "stream")) {
      throw new HttpException("Access denied", HttpStatus.FORBIDDEN)
    }

    const token = this.drmService.generateStreamingToken(trackId, userId)

    return {
      token,
      expiresIn: 3600,
      trackId,
    }
  }

  @Get("audio/:trackId")
  @RateLimit(RateLimitConfigs.STREAMING)
  @RequireApiKeyScopes(ApiKeyScope.STREAM)
  async streamAudio(
    @Param('trackId') trackId: string,
    @Query('token') token: string,
    @Query('chunk') chunk: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Validate DRM token
    const drmToken = this.drmService.validateStreamingToken(token)

    if (!drmToken || drmToken.trackId !== trackId) {
      throw new HttpException("Invalid streaming token", HttpStatus.UNAUTHORIZED)
    }

    // Check permissions
    if (!drmToken.permissions.includes("stream")) {
      throw new HttpException("Insufficient permissions", HttpStatus.FORBIDDEN)
    }

    try {
      // In a real implementation, you would:
      // 1. Fetch the audio chunk from your storage
      // 2. Decrypt it using DRM service
      // 3. Add watermark
      // 4. Stream to client

      const audioChunk = Buffer.from("mock-audio-data") // Replace with actual audio data
      const decryptedChunk = this.drmService.decryptAudioChunk(audioChunk, trackId)

      // Add watermark
      const watermark = this.drmService.generateWatermark(drmToken.userId, trackId)

      res.setHeader("Content-Type", "audio/mpeg")
      res.setHeader("X-Watermark", watermark)
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
      res.setHeader("Pragma", "no-cache")
      res.setHeader("Expires", "0")

      res.send(decryptedChunk)
    } catch (error) {
      throw new HttpException("Streaming error", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
