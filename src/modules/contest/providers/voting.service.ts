import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type ContestVote, VoteType } from "../entities/contest-vote.entity"
import type { ContestSubmission } from "../entities/contest-submission.entity"
import { type Contest, ContestStatus, VotingType } from "../entities/contest.entity"
import { type ContestJury, JuryStatus } from "../entities/contest-jury.entity"
import type { VoteDto } from "../dto/vote.dto"

@Injectable()
export class VotingService {
  constructor(
    private voteRepository: Repository<ContestVote>,
    private submissionRepository: Repository<ContestSubmission>,
    private contestRepository: Repository<Contest>,
    private juryRepository: Repository<ContestJury>,
  ) {}

  async vote(submissionId: string, userId: string, voteDto: VoteDto): Promise<ContestVote> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ["contest"],
    })

    if (!submission) {
      throw new NotFoundException("Submission not found")
    }

    const contest = submission.contest

    // Check if voting is allowed
    const now = new Date()
    if (contest.status !== ContestStatus.VOTING) {
      throw new BadRequestException("Voting is not currently open for this contest")
    }

    if (now < contest.votingStartDate || now > contest.votingEndDate) {
      throw new BadRequestException("Voting period has ended")
    }

    // Check if user can vote
    if (submission.userId === userId) {
      throw new BadRequestException("You cannot vote for your own submission")
    }

    // Check voting type permissions
    if (contest.votingType === VotingType.JURY) {
      const jury = await this.juryRepository.findOne({
        where: { contestId: contest.id, userId, status: JuryStatus.ACCEPTED },
      })

      if (!jury) {
        throw new ForbiddenException("Only jury members can vote in this contest")
      }
    }

    // Check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: { submissionId, userId },
    })

    if (existingVote) {
      throw new BadRequestException("You have already voted for this submission")
    }

    // Validate vote data
    if (voteDto.type === VoteType.RATING && (!voteDto.rating || voteDto.rating < 1 || voteDto.rating > 5)) {
      throw new BadRequestException("Rating must be between 1 and 5")
    }

    // Get jury weight if applicable
    let weight = 1.0
    if (contest.votingType === VotingType.JURY || contest.votingType === VotingType.HYBRID) {
      const jury = await this.juryRepository.findOne({
        where: { contestId: contest.id, userId, status: JuryStatus.ACCEPTED },
      })
      if (jury) {
        weight = jury.votingWeight
      }
    }

    const vote = this.voteRepository.create({
      contestId: contest.id,
      submissionId,
      userId,
      type: voteDto.type,
      rating: voteDto.rating,
      isPositive: voteDto.isPositive ?? true,
      comment: voteDto.comment,
      weight,
    })

    const savedVote = await this.voteRepository.save(vote)

    // Update submission vote count and average rating
    await this.updateSubmissionStats(submissionId)

    // Update contest total votes
    await this.contestRepository.increment({ id: contest.id }, "totalVotes", 1)

    return savedVote
  }

  async removeVote(submissionId: string, userId: string): Promise<void> {
    const vote = await this.voteRepository.findOne({
      where: { submissionId, userId },
      relations: ["submission", "contest"],
    })

    if (!vote) {
      throw new NotFoundException("Vote not found")
    }

    const contest = vote.submission.contest
    if (contest.status !== ContestStatus.VOTING) {
      throw new BadRequestException("Cannot remove vote outside voting period")
    }

    await this.voteRepository.remove(vote)

    // Update submission stats
    await this.updateSubmissionStats(submissionId)

    // Update contest total votes
    await this.contestRepository.decrement({ id: contest.id }, "totalVotes", 1)
  }

  async getVotes(submissionId: string): Promise<ContestVote[]> {
    return this.voteRepository.find({
      where: { submissionId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    })
  }

  async getUserVote(submissionId: string, userId: string): Promise<ContestVote | null> {
    return this.voteRepository.findOne({
      where: { submissionId, userId },
    })
  }

  private async updateSubmissionStats(submissionId: string): Promise<void> {
    const votes = await this.voteRepository.find({
      where: { submissionId },
    })

    const voteCount = votes.length
    const totalRating = votes.filter((vote) => vote.rating).reduce((sum, vote) => sum + vote.rating * vote.weight, 0)
    const totalWeight = votes.filter((vote) => vote.rating).reduce((sum, vote) => sum + vote.weight, 0)

    const averageRating = totalWeight > 0 ? totalRating / totalWeight : 0

    await this.submissionRepository.update(submissionId, {
      voteCount,
      averageRating: Math.round(averageRating * 100) / 100,
    })
  }

  async getContestVotingStats(contestId: string): Promise<any> {
    const totalVotes = await this.voteRepository.count({
      where: { contestId },
    })

    const votesByType = await this.voteRepository
      .createQueryBuilder("vote")
      .select("vote.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("vote.contestId = :contestId", { contestId })
      .groupBy("vote.type")
      .getRawMany()

    const topVotedSubmissions = await this.submissionRepository.find({
      where: { contestId },
      relations: ["user", "track"],
      order: { voteCount: "DESC" },
      take: 10,
    })

    return {
      totalVotes,
      votesByType,
      topVotedSubmissions,
    }
  }
}
