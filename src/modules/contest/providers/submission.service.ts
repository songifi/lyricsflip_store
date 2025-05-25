import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type ContestSubmission, SubmissionStatus } from "../entities/contest-submission.entity"
import { type Contest, ContestStatus } from "../entities/contest.entity"
import type { Track } from "../../music/tracks/entities/track.entity"
import type { SubmitEntryDto } from "../dto/submit-entry.dto"

@Injectable()
export class SubmissionService {
  constructor(
    private submissionRepository: Repository<ContestSubmission>,
    private contestRepository: Repository<Contest>,
    private trackRepository: Repository<Track>,
  ) {}

  async submitEntry(contestId: string, userId: string, submitEntryDto: SubmitEntryDto): Promise<ContestSubmission> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
    })

    if (!contest) {
      throw new NotFoundException("Contest not found")
    }

    // Check if contest is accepting submissions
    const now = new Date()
    if (contest.status !== ContestStatus.ACTIVE) {
      throw new BadRequestException("Contest is not accepting submissions")
    }

    if (now < contest.submissionStartDate || now > contest.submissionEndDate) {
      throw new BadRequestException("Submission period has ended")
    }

    // Check if user already submitted
    const existingSubmission = await this.submissionRepository.findOne({
      where: { contestId, userId },
    })

    if (existingSubmission) {
      throw new BadRequestException("You have already submitted to this contest")
    }

    // Validate track
    const track = await this.trackRepository.findOne({
      where: { id: submitEntryDto.trackId, userId },
    })

    if (!track) {
      throw new NotFoundException("Track not found or you do not own this track")
    }

    // Check track duration
    if (track.duration > contest.maxTrackDuration || track.duration < contest.minTrackDuration) {
      throw new BadRequestException(
        `Track duration must be between ${contest.minTrackDuration} and ${contest.maxTrackDuration} seconds`,
      )
    }

    // Check genre restrictions
    if (contest.allowedGenres?.length > 0 && !contest.allowedGenres.includes(track.genre)) {
      throw new BadRequestException("Track genre is not allowed in this contest")
    }

    // Check max submissions
    if (contest.maxSubmissions > 0) {
      const submissionCount = await this.submissionRepository.count({
        where: { contestId },
      })

      if (submissionCount >= contest.maxSubmissions) {
        throw new BadRequestException("Contest has reached maximum submissions")
      }
    }

    const submission = this.submissionRepository.create({
      contestId,
      userId,
      trackId: submitEntryDto.trackId,
      title: submitEntryDto.title || track.title,
      description: submitEntryDto.description,
      metadata: submitEntryDto.metadata,
    })

    const savedSubmission = await this.submissionRepository.save(submission)

    // Update contest participant count
    await this.contestRepository.increment({ id: contestId }, "participantCount", 1)

    return savedSubmission
  }

  async getSubmissions(contestId: string, status?: SubmissionStatus): Promise<ContestSubmission[]> {
    const where: any = { contestId }
    if (status) {
      where.status = status
    }

    return this.submissionRepository.find({
      where,
      relations: ["user", "track", "votes"],
      order: { voteCount: "DESC", createdAt: "ASC" },
    })
  }

  async getSubmission(id: string): Promise<ContestSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ["user", "track", "contest", "votes"],
    })

    if (!submission) {
      throw new NotFoundException("Submission not found")
    }

    return submission
  }

  async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    rejectionReason?: string,
  ): Promise<ContestSubmission> {
    const submission = await this.getSubmission(id)

    submission.status = status
    if (rejectionReason) {
      submission.rejectionReason = rejectionReason
    }

    return this.submissionRepository.save(submission)
  }

  async withdrawSubmission(id: string, userId: string): Promise<void> {
    const submission = await this.getSubmission(id)

    if (submission.userId !== userId) {
      throw new ForbiddenException("You can only withdraw your own submissions")
    }

    if (submission.contest.status !== ContestStatus.ACTIVE) {
      throw new BadRequestException("Cannot withdraw submission after submission period")
    }

    await this.submissionRepository.remove(submission)

    // Update contest participant count
    await this.contestRepository.decrement({ id: submission.contestId }, "participantCount", 1)
  }

  async getUserSubmissions(userId: string): Promise<ContestSubmission[]> {
    return this.submissionRepository.find({
      where: { userId },
      relations: ["contest", "track"],
      order: { createdAt: "DESC" },
    })
  }

  async calculateRankings(contestId: string): Promise<void> {
    const submissions = await this.submissionRepository.find({
      where: { contestId, status: SubmissionStatus.APPROVED },
      order: { voteCount: "DESC", averageRating: "DESC" },
    })

    for (let i = 0; i < submissions.length; i++) {
      submissions[i].rank = i + 1
      await this.submissionRepository.save(submissions[i])
    }
  }
}
