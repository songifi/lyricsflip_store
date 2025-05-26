import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from "@nestjs/common"
import type { MeditationService } from "./meditation.service"
import type { CreateMeditationSessionDto, UpdateMeditationSessionDto } from "../dto/meditation-session.dto"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"

@Controller("wellness/meditation")
@UseGuards(JwtAuthGuard)
export class MeditationController {
  constructor(private readonly meditationService: MeditationService) {}

  @Post("sessions")
  async startSession(@Request() req: any, @Body() sessionData: CreateMeditationSessionDto) {
    return this.meditationService.startMeditationSession(req.user.id, sessionData)
  }

  @Put("sessions/:sessionId")
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
    @Body() updateData: UpdateMeditationSessionDto,
  ) {
    return this.meditationService.updateMeditationSession(sessionId, req.user.id, updateData)
  }

  @Get("sessions")
  async getUserSessions(@Request() req: any, @Query('limit') limit?: number) {
    return this.meditationService.getUserSessions(req.user.id, limit)
  }

  @Get("sessions/:sessionId")
  async getSession(@Param('sessionId') sessionId: string, @Request() req: any) {
    return this.meditationService.getSessionById(sessionId, req.user.id)
  }

  @Get('stats')
  async getMeditationStats(@Request() req: any) {
    return this.meditationService.getMeditationStats(req.user.id);
  }
}
