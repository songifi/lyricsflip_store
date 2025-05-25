import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ModerationCase, ModerationStatus, Priority } from "../entities/moderation-case.entity"
import { ModerationAction, ActionType } from "../entities/moderation-action.entity"
import { ModerationRule } from "../entities/moderation-rule.entity"
import type { ContentScanningService } from "./content-scanning.service"
import type { CreateModerationCaseDto } from "../dto/create-moderation-case.dto"
import type { CreateModerationActionDto } from "../dto/moderation-action.dto"

@Injectable()
export class ModerationWorkflowService {
  private readonly logger = new Logger(ModerationWorkflowService.name);

  constructor(
    private moderationCaseRepository: Repository<ModerationCase>,
    private moderationActionRepository: Repository<ModerationAction>,
    private moderationRuleRepository: Repository<ModerationRule>,
    private contentScanningService: ContentScanningService,
    @InjectRepository(ModerationCase)
    private moderationCaseRepositoryInjection: Repository<ModerationCase>,
    @InjectRepository(ModerationAction)
    private moderationActionRepositoryInjection: Repository<ModerationAction>,
    @InjectRepository(ModerationRule)
    private moderationRuleRepositoryInjection: Repository<ModerationRule>,
  ) {}

  async createModerationCase(dto: CreateModerationCaseDto, content?: any): Promise<ModerationCase> {
    this.logger.log(`Creating moderation case for ${dto.contentType}: ${dto.contentId}`)

    // Scan content if provided
    let scanResults = null
    if (content) {
      scanResults = await this.contentScanningService.scanContent(dto.contentType, dto.contentId, content)
    }

    const moderationCase = this.moderationCaseRepository.create({
      ...dto,
      scanResults,
      confidenceScore: scanResults?.confidenceScore || dto.confidenceScore || 0,
      violationTypes: scanResults?.violationTypes || dto.violationTypes || [],
    })

    // Auto-assign priority based on violation types and confidence
    if (!dto.priority) {
      moderationCase.priority = this.calculatePriority(moderationCase)
    }

    // Auto-approve or reject based on rules
    const autoDecision = await this.checkAutoModerationRules(moderationCase)
    if (autoDecision) {
      moderationCase.status = autoDecision.status
      moderationCase.isAutomated = true
    }

    const savedCase = await this.moderationCaseRepository.save(moderationCase)

    // Create initial action if auto-decided
    if (autoDecision) {
      await this.createModerationAction({
        moderationCaseId: savedCase.id,
        actionType: autoDecision.actionType,
        reason: autoDecision.reason,
        performedByUserId: "system",
      })
    }

    return savedCase
  }

  async createModerationAction(dto: CreateModerationActionDto): Promise<ModerationAction> {
    const action = this.moderationActionRepository.create(dto)
    const savedAction = await this.moderationActionRepository.save(action)

    // Update moderation case status based on action
    await this.updateCaseStatusFromAction(dto.moderationCaseId, dto.actionType)

    return savedAction
  }

  async assignModerator(caseId: string, moderatorId: string): Promise<void> {
    await this.moderationCaseRepository.update(caseId, {
      assignedToUserId: moderatorId,
      status: ModerationStatus.UNDER_REVIEW,
    })
  }

  async escalateCase(caseId: string, reason: string, escalatedBy: string): Promise<void> {
    await this.moderationCaseRepository.update(caseId, {
      priority: Priority.HIGH,
      assignedToUserId: null, // Unassign to allow senior moderators to pick up
    })

    await this.createModerationAction({
      moderationCaseId: caseId,
      actionType: ActionType.ESCALATE,
      reason,
      performedByUserId: escalatedBy,
    })
  }

  async getPendingCases(moderatorId?: string): Promise<ModerationCase[]> {
    const query = this.moderationCaseRepository
      .createQueryBuilder("case")
      .leftJoinAndSelect("case.reportedBy", "reportedBy")
      .leftJoinAndSelect("case.assignedTo", "assignedTo")
      .where("case.status IN (:...statuses)", {
        statuses: [ModerationStatus.PENDING, ModerationStatus.UNDER_REVIEW],
      })

    if (moderatorId) {
      query.andWhere("(case.assignedToUserId = :moderatorId OR case.assignedToUserId IS NULL)", {
        moderatorId,
      })
    }

    return query.orderBy("case.priority", "DESC").addOrderBy("case.createdAt", "ASC").getMany()
  }

  private calculatePriority(moderationCase: ModerationCase): Priority {
    const { violationTypes, confidenceScore } = moderationCase

    // High priority violations
    const highPriorityViolations = ["hate_speech", "violence", "harassment"]
    if (violationTypes.some((type) => highPriorityViolations.includes(type))) {
      return Priority.HIGH
    }

    // High confidence violations
    if (confidenceScore > 0.8) {
      return Priority.HIGH
    }

    // Medium confidence violations
    if (confidenceScore > 0.6) {
      return Priority.MEDIUM
    }

    return Priority.LOW
  }

  private async checkAutoModerationRules(moderationCase: ModerationCase): Promise<any> {
    const rules = await this.moderationRuleRepository.find({
      where: { isActive: true },
    })

    for (const rule of rules) {
      if (this.ruleApplies(rule, moderationCase)) {
        if (moderationCase.confidenceScore >= rule.confidenceThreshold) {
          return this.executeRuleActions(rule)
        }
      }
    }

    return null
  }

  private ruleApplies(rule: ModerationRule, moderationCase: ModerationCase): boolean {
    // Check if content type matches
    if (!rule.applicableContentTypes.includes(moderationCase.contentType)) {
      return false
    }

    // Check if violation type matches
    if (!moderationCase.violationTypes.includes(rule.violationType)) {
      return false
    }

    return true
  }

  private executeRuleActions(rule: ModerationRule): any {
    const actions = rule.actions

    if (actions.autoApprove) {
      return {
        status: ModerationStatus.APPROVED,
        actionType: ActionType.APPROVE,
        reason: `Auto-approved by rule: ${rule.name}`,
      }
    }

    if (actions.autoReject) {
      return {
        status: ModerationStatus.REJECTED,
        actionType: ActionType.REJECT,
        reason: `Auto-rejected by rule: ${rule.name}`,
      }
    }

    return null
  }

  private async updateCaseStatusFromAction(caseId: string, actionType: ActionType): Promise<void> {
    let status: ModerationStatus
    let resolvedAt: Date | null = null

    switch (actionType) {
      case ActionType.APPROVE:
        status = ModerationStatus.APPROVED
        resolvedAt = new Date()
        break
      case ActionType.REJECT:
        status = ModerationStatus.REJECTED
        resolvedAt = new Date()
        break
      case ActionType.FLAG:
        status = ModerationStatus.FLAGGED
        break
      case ActionType.ESCALATE:
        status = ModerationStatus.UNDER_REVIEW
        break
      default:
        return
    }

    await this.moderationCaseRepository.update(caseId, {
      status,
      resolvedAt,
    })
  }
}
