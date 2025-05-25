import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Contest } from "../entities/contest.entity"
import type { ContestSubmission } from "../entities/contest-submission.entity"
import type { ContestVote } from "../entities/contest-vote.entity"

@Injectable()
export class AnalyticsService {
  constructor(
    private contestRepository: Repository<Contest>,
    private submissionRepository: Repository<ContestSubmission>,
    private voteRepository: Repository<ContestVote>,
  ) {}

  async getContestAnalytics(contestId: string): Promise<any> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
      relations: ["submissions", "votes", "prizes"],
    })

    if (!contest) {
      throw new Error("Contest not found")
    }

    // Participation metrics
    const totalSubmissions = await this.submissionRepository.count({
      where: { contestId },
    })

    const approvedSubmissions = await this.submissionRepository.count({
      where: { contestId, status: "approved" },
    })

    const uniqueParticipants = await this.submissionRepository
      .createQueryBuilder("submission")
      .select("COUNT(DISTINCT submission.userId)", "count")
      .where("submission.contestId = :contestId", { contestId })
      .getRawOne()

    // Voting metrics
    const totalVotes = await this.voteRepository.count({
      where: { contestId },
    })

    const uniqueVoters = await this.voteRepository
      .createQueryBuilder("vote")
      .select("COUNT(DISTINCT vote.userId)", "count")
      .where("vote.contestId = :contestId", { contestId })
      .getRawOne()

    const votesByType = await this.voteRepository
      .createQueryBuilder("vote")
      .select("vote.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("vote.contestId = :contestId", { contestId })
      .groupBy("vote.type")
      .getRawMany()

    // Engagement metrics
    const dailyVotes = await this.voteRepository
      .createQueryBuilder("vote")
      .select("DATE(vote.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .where("vote.contestId = :contestId", { contestId })
      .groupBy("DATE(vote.createdAt)")
      .orderBy("DATE(vote.createdAt)", "ASC")
      .getRawMany()

    const dailySubmissions = await this.submissionRepository
      .createQueryBuilder("submission")
      .select("DATE(submission.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .where("submission.contestId = :contestId", { contestId })
      .groupBy("DATE(submission.createdAt)")
      .orderBy("DATE(submission.createdAt)", "ASC")
      .getRawMany()

    // Top performers
    const topSubmissions = await this.submissionRepository.find({
      where: { contestId },
      relations: ["user", "track"],
      order: { voteCount: "DESC" },
      take: 10,
    })

    const mostActiveVoters = await this.voteRepository
      .createQueryBuilder("vote")
      .select("vote.userId", "userId")
      .addSelect("user.username", "username")
      .addSelect("COUNT(*)", "voteCount")
      .leftJoin("vote.user", "user")
      .where("vote.contestId = :contestId", { contestId })
      .groupBy("vote.userId, user.username")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany()

    return {
      contest: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
        viewCount: contest.viewCount,
      },
      participation: {
        totalSubmissions,
        approvedSubmissions,
        uniqueParticipants: Number.parseInt(uniqueParticipants.count),
        participationRate: totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0,
      },
      voting: {
        totalVotes,
        uniqueVoters: Number.parseInt(uniqueVoters.count),
        votesByType,
        averageVotesPerSubmission: approvedSubmissions > 0 ? totalVotes / approvedSubmissions : 0,
      },
      engagement: {
        dailyVotes,
        dailySubmissions,
        engagementRate: uniqueParticipants.count > 0 ? (uniqueVoters.count / uniqueParticipants.count) * 100 : 0,
      },
      topPerformers: {
        topSubmissions,
        mostActiveVoters,
      },
    }
  }

  async getPlatformAnalytics(): Promise<any> {
    // Overall platform metrics
    const totalContests = await this.contestRepository.count()
    const activeContests = await this.contestRepository.count({
      where: { status: "active" },
    })
    const completedContests = await this.contestRepository.count({
      where: { status: "completed" },
    })

    const totalSubmissions = await this.submissionRepository.count()
    const totalVotes = await this.voteRepository.count()

    // Contest types distribution
    const contestsByType = await this.contestRepository
      .createQueryBuilder("contest")
      .select("contest.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("contest.type")
      .getRawMany()

    // Monthly contest creation trends
    const monthlyContests = await this.contestRepository
      .createQueryBuilder("contest")
      .select("DATE_TRUNC('month', contest.createdAt)", "month")
      .addSelect("COUNT(*)", "count")
      .groupBy("DATE_TRUNC('month', contest.createdAt)")
      .orderBy("DATE_TRUNC('month', contest.createdAt)", "ASC")
      .getRawMany()

    // Most popular contests
    const popularContests = await this.contestRepository.find({
      relations: ["organizer"],
      order: { participantCount: "DESC" },
      take: 10,
    })

    return {
      overview: {
        totalContests,
        activeContests,
        completedContests,
        totalSubmissions,
        totalVotes,
      },
      distribution: {
        contestsByType,
      },
      trends: {
        monthlyContests,
      },
      popular: {
        contests: popularContests,
      },
    }
  }

  async getUserContestAnalytics(userId: string): Promise<any> {
    // User's contest participation
    const userSubmissions = await this.submissionRepository.count({
      where: { userId },
    })

    const userVotes = await this.voteRepository.count({
      where: { userId },
    })

    const userWins = await this.submissionRepository.count({
      where: { userId, isWinner: true },
    })

    // User's contest performance
    const submissionStats = await this.submissionRepository
      .createQueryBuilder("submission")
      .select("AVG(submission.voteCount)", "avgVotes")
      .addSelect("AVG(submission.averageRating)", "avgRating")
      .addSelect("MAX(submission.voteCount)", "maxVotes")
      .where("submission.userId = :userId", { userId })
      .getRawOne()

    // Recent activity
    const recentSubmissions = await this.submissionRepository.find({
      where: { userId },
      relations: ["contest", "track"],
      order: { createdAt: "DESC" },
      take: 5,
    })

    const recentVotes = await this.voteRepository.find({
      where: { userId },
      relations: ["submission", "contest"],
      order: { createdAt: "DESC" },
      take: 10,
    })

    return {
      overview: {
        totalSubmissions: userSubmissions,
        totalVotes: userVotes,
        totalWins: userWins,
        winRate: userSubmissions > 0 ? (userWins / userSubmissions) * 100 : 0,
      },
      performance: {
        averageVotes: Number.parseFloat(submissionStats.avgVotes) || 0,
        averageRating: Number.parseFloat(submissionStats.avgRating) || 0,
        bestPerformance: Number.parseInt(submissionStats.maxVotes) || 0,
      },
      activity: {
        recentSubmissions,
        recentVotes,
      },
    }
  }
}
