import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Appeal, AppealStatus } from "../entities/appeal.entity"
import { type ModerationCase, ModerationStatus } from "../entities/moderation-case.entity"
import type { CreateAppealDto } from "../dto/create-appeal.dto"

@Injectable()
export class AppealService {
  private readonly logger = new Logger(AppealService.name)

  constructor(
    private appealRepository: Repository<Appeal>,
    private moderationCaseRepository: Repository<ModerationCase>,
  ) {}

  async createAppeal(dto: CreateAppealDto): Promise<Appeal> {
    this.logger.log(`Creating appeal for case: ${dto.moderationCaseId}`)

    // Check if case exists and is eligible for appeal
    const moderationCase = await this.moderationCaseRepository.findOne({
      where: { id: dto.moderationCaseId },
    })

    if (!moderationCase) {
      throw new Error("Moderation case not found")
    }

    if (moderationCase.status !== ModerationStatus.REJECTED) {
      throw new Error("Only rejected cases can be appealed")
    }

    // Check if there's already a pending appeal
    const existingAppeal = await this.appealRepository.findOne({
      where: {
        moderationCaseId: dto.moderationCaseId,
        status: AppealStatus.PENDING,
      },
    })

    if (existingAppeal) {
      throw new Error("There is already a pending appeal for this case")
    }

    const appeal = this.appealRepository.create(dto)
    const savedAppeal = await this.appealRepository.save(appeal)

    // Update moderation case status
    await this.moderationCaseRepository.update(dto.moderationCaseId, {
      status: ModerationStatus.APPEALED,
    })

    return savedAppeal
  }

  async reviewAppeal(
    appealId: string,
    reviewerId: string,
    decision: AppealStatus.APPROVED | AppealStatus.DENIED,
    reviewNotes?: string,
  ): Promise<Appeal> {
    const appeal = await this.appealRepository.findOne({
      where: { id: appealId },
      relations: ["moderationCase"],
    })

    if (!appeal) {
      throw new Error("Appeal not found")
    }

    appeal.status = decision
    appeal.reviewedByUserId = reviewerId
    appeal.reviewNotes = reviewNotes
    appeal.resolvedAt = new Date()

    const savedAppeal = await this.appealRepository.save(appeal)

    // Update moderation case based on appeal decision
    if (decision === AppealStatus.APPROVED) {
      await this.moderationCaseRepository.update(appeal.moderationCaseId, {
        status: ModerationStatus.APPROVED,
        resolvedAt: new Date(),
      })
    } else {
      await this.moderationCaseRepository.update(appeal.moderationCaseId, {
        status: ModerationStatus.RESOLVED,
        resolvedAt: new Date(),
      })
    }

    return savedAppeal
  }

  async getPendingAppeals(): Promise<Appeal[]> {
    return this.appealRepository.find({
      where: { status: AppealStatus.PENDING },
      relations: ["moderationCase", "submittedBy"],
      order: { createdAt: "ASC" },
    })
  }

  async getAppealsByUser(userId: string): Promise<Appeal[]> {
    return this.appealRepository.find({
      where: { submittedByUserId: userId },
      relations: ["moderationCase"],
      order: { createdAt: "DESC" },
    })
  }
}
