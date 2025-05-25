import { Controller, Get, Post, Put, Body, Param, Query, Request, Delete } from "@nestjs/common"
import type { ModerationService } from "./moderation.service"
import type { CreateModerationCaseDto } from "./dto/create-moderation-case.dto"
import type { FlagContentDto } from "./dto/flag-content.dto"
import type { CreateAppealDto } from "./dto/create-appeal.dto"
import type { CreateModerationActionDto } from "./dto/moderation-action.dto"
import type { AppealStatus } from "./entities/appeal.entity"
import type { ModerationRole } from "./entities/moderation-team-member.entity"

// You'll need to implement these guards based on your auth system
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { ModerationGuard } from './guards/moderation.guard';

@Controller("moderation")
// @UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  // Content moderation workflow
  @Post('cases')
  // @UseGuards(ModerationGuard)
  async createModerationCase(@Body() dto: CreateModerationCaseDto) {
    return this.moderationService.createModerationCase(dto);
  }

  @Get('cases')
  // @UseGuards(ModerationGuard)
  async getPendingCases(@Query('moderatorId') moderatorId?: string) {
    return this.moderationService.getPendingCases(moderatorId);
  }

  @Get('cases/:id')
  // @UseGuards(ModerationGuard)
  async getModerationCase(@Param('id') id: string) {
    return this.moderationService.getModerationCase(id);
  }

  @Put("cases/:id/assign")
  // @UseGuards(ModerationGuard)
  async assignModerator(@Param('id') caseId: string, @Body('moderatorId') moderatorId: string) {
    return this.moderationService.assignModerator(caseId, moderatorId)
  }

  @Post('actions')
  // @UseGuards(ModerationGuard)
  async createModerationAction(@Body() dto: CreateModerationActionDto) {
    return this.moderationService.createModerationAction(dto);
  }

  @Put("cases/:id/escalate")
  // @UseGuards(ModerationGuard)
  async escalateCase(@Param('id') caseId: string, @Body('reason') reason: string, @Request() req: any) {
    return this.moderationService.escalateCase(caseId, reason, req.user.id)
  }

  // User flagging
  @Post("flags")
  async flagContent(@Body() dto: FlagContentDto, @Request() req: any) {
    dto.reportedByUserId = req.user.id
    return this.moderationService.flagContent(dto)
  }

  @Get("flags/content/:contentType/:contentId")
  // @UseGuards(ModerationGuard)
  async getFlagsForContent(@Param('contentType') contentType: string, @Param('contentId') contentId: string) {
    return this.moderationService.getFlagsForContent(contentType, contentId)
  }

  @Get("flags/user/:userId")
  async getUserFlags(@Param('userId') userId: string, @Request() req: any) {
    // Users can only see their own flags, moderators can see any user's flags
    const canViewAll = await this.moderationService.canModerate(req.user.id)
    const targetUserId = canViewAll ? userId : req.user.id
    return this.moderationService.getUserFlags(targetUserId)
  }

  // Appeals
  @Post("appeals")
  async createAppeal(@Body() dto: CreateAppealDto, @Request() req: any) {
    dto.submittedByUserId = req.user.id
    return this.moderationService.createAppeal(dto)
  }

  @Get("appeals")
  // @UseGuards(ModerationGuard)
  async getPendingAppeals() {
    return this.moderationService.getPendingAppeals()
  }

  @Get("appeals/user/:userId")
  async getAppealsByUser(@Param('userId') userId: string, @Request() req: any) {
    // Users can only see their own appeals, moderators can see any user's appeals
    const canViewAll = await this.moderationService.canModerate(req.user.id)
    const targetUserId = canViewAll ? userId : req.user.id
    return this.moderationService.getAppealsByUser(targetUserId)
  }

  @Put("appeals/:id/review")
  // @UseGuards(ModerationGuard)
  async reviewAppeal(
    @Param('id') appealId: string,
    @Body('decision') decision: AppealStatus.APPROVED | AppealStatus.DENIED,
    @Body('reviewNotes') reviewNotes: string,
    @Request() req: any,
  ) {
    return this.moderationService.reviewAppeal(appealId, req.user.id, decision, reviewNotes)
  }

  // Analytics
  @Get("analytics")
  // @UseGuards(ModerationGuard)
  async getAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('contentType') contentType?: string,
    @Query('violationType') violationType?: string,
  ) {
    return this.moderationService.getAnalytics(new Date(startDate), new Date(endDate), contentType, violationType)
  }

  @Get("analytics/dashboard")
  // @UseGuards(ModerationGuard)
  async getDashboardMetrics() {
    return this.moderationService.getDashboardMetrics()
  }

  // Team management
  @Post("team")
  // @UseGuards(ModerationGuard) // Should require admin permissions
  async addTeamMember(
    @Body('userId') userId: string,
    @Body('role') role: ModerationRole,
    @Body('permissions') permissions: string[] = [],
  ) {
    return this.moderationService.addTeamMember(userId, role, permissions)
  }

  @Put("team/:userId")
  // @UseGuards(ModerationGuard) // Should require admin permissions
  async updateTeamMember(@Param('userId') userId: string, @Body() updates: any) {
    return this.moderationService.updateTeamMember(userId, updates)
  }

  @Delete('team/:userId')
  // @UseGuards(ModerationGuard) // Should require admin permissions
  async removeTeamMember(@Param('userId') userId: string) {
    return this.moderationService.removeTeamMember(userId);
  }

  @Get("team")
  // @UseGuards(ModerationGuard)
  async getTeamMembers() {
    return this.moderationService.getTeamMembers()
  }
}
