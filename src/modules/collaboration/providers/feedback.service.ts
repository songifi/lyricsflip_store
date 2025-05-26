import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Feedback, FeedbackStatus } from "../entities/feedback.entity"
import type { AudioVersion } from "../entities/audio-version.entity"
import { type ProjectMember, MemberStatus } from "../entities/project-member.entity"
import type { AddFeedbackDto } from "../dto/add-feedback.dto"

@Injectable()
export class FeedbackService {
  constructor(
    private feedbackRepository: Repository<Feedback>,
    private audioVersionRepository: Repository<AudioVersion>,
    private memberRepository: Repository<ProjectMember>,
  ) {}

  async addFeedback(versionId: string, userId: string, addFeedbackDto: AddFeedbackDto): Promise<Feedback> {
    const audioVersion = await this.audioVersionRepository.findOne({
      where: { id: versionId },
    })

    if (!audioVersion) {
      throw new NotFoundException("Audio version not found")
    }

    // Check if user has permission
    const member = await this.memberRepository.findOne({
      where: {
        projectId: audioVersion.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    if (!member?.permissions?.canLeaveComments) {
      throw new ForbiddenException("You do not have permission to leave feedback")
    }

    const feedback = this.feedbackRepository.create({
      ...addFeedbackDto,
      audioVersionId: versionId,
      authorId: userId,
    })

    return this.feedbackRepository.save(feedback)
  }

  async getVersionFeedback(versionId: string, userId: string): Promise<Feedback[]> {
    const audioVersion = await this.audioVersionRepository.findOne({
      where: { id: versionId },
    })

    if (!audioVersion) {
      throw new NotFoundException("Audio version not found")
    }

    // Check if user has access
    const member = await this.memberRepository.findOne({
      where: {
        projectId: audioVersion.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    if (!member) {
      throw new ForbiddenException("Access denied")
    }

    return this.feedbackRepository
      .createQueryBuilder("feedback")
      .leftJoinAndSelect("feedback.author", "author")
      .leftJoinAndSelect("feedback.parentFeedback", "parent")
      .where("feedback.audioVersionId = :versionId", { versionId })
      .orderBy("feedback.createdAt", "ASC")
      .getMany()
  }

  async updateFeedbackStatus(feedbackId: string, userId: string, status: FeedbackStatus): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      relations: ["audioVersion"],
    })

    if (!feedback) {
      throw new NotFoundException("Feedback not found")
    }

    // Check if user has permission (author or project admin)
    const member = await this.memberRepository.findOne({
      where: {
        projectId: feedback.audioVersion.projectId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    })

    const canUpdate = member?.permissions?.canManageTasks || feedback.authorId === userId
    if (!canUpdate) {
      throw new ForbiddenException("You do not have permission to update this feedback")
    }

    feedback.status = status
    return this.feedbackRepository.save(feedback)
  }
}
