import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ContentFlag } from "../entities/content-flag.entity"
import type { ModerationWorkflowService } from "./moderation-workflow.service"
import type { FlagContentDto } from "../dto/flag-content.dto"

@Injectable()
export class UserFlaggingService {
  private readonly logger = new Logger(UserFlaggingService.name);

  constructor(
    private moderationWorkflowService: ModerationWorkflowService,
    @InjectRepository(ContentFlag)
    private contentFlagRepository: Repository<ContentFlag>,
  ) {}

  async flagContent(dto: FlagContentDto): Promise<ContentFlag> {
    this.logger.log(`User ${dto.reportedByUserId} flagged ${dto.contentType}: ${dto.contentId}`)

    // Check if user has already flagged this content
    const existingFlag = await this.contentFlagRepository.findOne({
      where: {
        contentType: dto.contentType,
        contentId: dto.contentId,
        reportedByUserId: dto.reportedByUserId,
      },
    })

    if (existingFlag) {
      throw new Error("You have already flagged this content")
    }

    const flag = this.contentFlagRepository.create(dto)
    const savedFlag = await this.contentFlagRepository.save(flag)

    // Check if this content has been flagged multiple times
    const flagCount = await this.contentFlagRepository.count({
      where: {
        contentType: dto.contentType,
        contentId: dto.contentId,
      },
    })

    // Create moderation case if threshold is reached
    if (flagCount >= 3) {
      // Configurable threshold
      const moderationCase = await this.moderationWorkflowService.createModerationCase({
        contentType: dto.contentType,
        contentId: dto.contentId,
        violationTypes: [dto.violationType],
        description: `Content flagged by ${flagCount} users`,
        reportedByUserId: dto.reportedByUserId,
      })

      // Mark all flags as processed
      await this.contentFlagRepository.update(
        {
          contentType: dto.contentType,
          contentId: dto.contentId,
          isProcessed: false,
        },
        {
          isProcessed: true,
          moderationCaseId: moderationCase.id,
        },
      )
    }

    return savedFlag
  }

  async getFlagsForContent(contentType: string, contentId: string): Promise<ContentFlag[]> {
    return this.contentFlagRepository.find({
      where: { contentType: contentType as any, contentId },
      relations: ["reportedBy"],
      order: { createdAt: "DESC" },
    })
  }

  async getUserFlags(userId: string): Promise<ContentFlag[]> {
    return this.contentFlagRepository.find({
      where: { reportedByUserId: userId },
      order: { createdAt: "DESC" },
    })
  }
}
