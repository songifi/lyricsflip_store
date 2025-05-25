import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ModerationCase } from "./entities/moderation-case.entity"
import type { ModerationWorkflowService } from "./services/moderation-workflow.service"
import type { UserFlaggingService } from "./services/user-flagging.service"
import type { AppealService } from "./services/appeal.service"
import type { ModerationAnalyticsService } from "./services/moderation-analytics.service"
import type { ModerationTeamService } from "./services/moderation-team.service"
import type { CreateModerationCaseDto } from "./dto/create-moderation-case.dto"
import type { FlagContentDto } from "./dto/flag-content.dto"
import type { CreateAppealDto } from "./dto/create-appeal.dto"
import type { CreateModerationActionDto } from "./dto/moderation-action.dto"

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ModerationCase) private moderationCaseRepository: Repository<ModerationCase>,
    private moderationWorkflowService: ModerationWorkflowService,
    private userFlaggingService: UserFlaggingService,
    private appealService: AppealService,
    private analyticsService: ModerationAnalyticsService,
    private teamService: ModerationTeamService,
  ) {}

  // Content moderation workflow
  async createModerationCase(dto: CreateModerationCaseDto, content?: any) {
    return this.moderationWorkflowService.createModerationCase(dto, content)
  }

  async getModerationCase(id: string) {
    return this.moderationCaseRepository.findOne({
      where: { id },
      relations: ["reportedBy", "assignedTo", "actions", "appeals"],
    })
  }

  async getPendingCases(moderatorId?: string) {
    return this.moderationWorkflowService.getPendingCases(moderatorId)
  }

  async assignModerator(caseId: string, moderatorId: string) {
    return this.moderationWorkflowService.assignModerator(caseId, moderatorId)
  }

  async createModerationAction(dto: CreateModerationActionDto) {
    return this.moderationWorkflowService.createModerationAction(dto)
  }

  async escalateCase(caseId: string, reason: string, escalatedBy: string) {
    return this.moderationWorkflowService.escalateCase(caseId, reason, escalatedBy)
  }

  // User flagging
  async flagContent(dto: FlagContentDto) {
    return this.userFlaggingService.flagContent(dto)
  }

  async getFlagsForContent(contentType: string, contentId: string) {
    return this.userFlaggingService.getFlagsForContent(contentType, contentId)
  }

  async getUserFlags(userId: string) {
    return this.userFlaggingService.getUserFlags(userId)
  }

  // Appeals
  async createAppeal(dto: CreateAppealDto) {
    return this.appealService.createAppeal(dto)
  }

  async reviewAppeal(appealId: string, reviewerId: string, decision: any, reviewNotes?: string) {
    return this.appealService.reviewAppeal(appealId, reviewerId, decision, reviewNotes)
  }

  async getPendingAppeals() {
    return this.appealService.getPendingAppeals()
  }

  async getAppealsByUser(userId: string) {
    return this.appealService.getAppealsByUser(userId)
  }

  // Analytics
  async getAnalytics(startDate: Date, endDate: Date, contentType?: any, violationType?: any) {
    return this.analyticsService.getAnalytics(startDate, endDate, contentType, violationType)
  }

  async getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics()
  }

  // Team management
  async addTeamMember(userId: string, role: any, permissions: string[] = []) {
    return this.teamService.addTeamMember(userId, role, permissions)
  }

  async updateTeamMember(userId: string, updates: any) {
    return this.teamService.updateTeamMember(userId, updates)
  }

  async removeTeamMember(userId: string) {
    return this.teamService.removeTeamMember(userId)
  }

  async getTeamMembers() {
    return this.teamService.getTeamMembers()
  }

  async canModerate(userId: string) {
    return this.teamService.canModerate(userId)
  }

  async hasPermission(userId: string, permission: string) {
    return this.teamService.hasPermission(userId, permission)
  }
}
