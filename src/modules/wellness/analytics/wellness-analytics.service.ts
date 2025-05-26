import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { WellnessOutcome, OutcomeType } from "../../../database/entities/wellness-outcome.entity"
import { type MeditationSession, SessionStatus } from "../../../database/entities/meditation-session.entity"
import type { MoodEntry } from "../../../database/entities/mood-entry.entity"
import type { UserWellnessProgress } from "../../../database/entities/user-wellness-progress.entity"

@Injectable()
export class WellnessAnalyticsService {
  constructor(
    private outcomeRepository: Repository<WellnessOutcome>,
    private sessionRepository: Repository<MeditationSession>,
    private moodRepository: Repository<MoodEntry>,
    private progressRepository: Repository<UserWellnessProgress>,
  ) {}

  async createOutcome(outcomeData: Partial<WellnessOutcome>): Promise<WellnessOutcome> {
    const outcome = this.outcomeRepository.create(outcomeData)
    return this.outcomeRepository.save(outcome)
  }

  async getUserOutcomes(userId: string): Promise<WellnessOutcome[]> {
    return this.outcomeRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
  }

  async getOutcomesByType(userId: string, outcomeType: OutcomeType): Promise<WellnessOutcome[]> {
    return this.outcomeRepository.find({
      where: { userId, outcomeType },
      order: { createdAt: "DESC" },
    })
  }

  async getWellnessReport(userId: string, days = 30): Promise<any> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get meditation stats
    const sessions = await this.sessionRepository.find({
      where: { userId },
      relations: ["program"],
    })

    const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED)
    const recentSessions = completedSessions.filter((s) => s.createdAt >= startDate)

    // Get mood trends
    const moodEntries = await this.moodRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })

    const recentMoods = moodEntries.filter((m) => m.createdAt >= startDate)

    // Get progress data
    const progress = await this.progressRepository.find({
      where: { userId },
      relations: ["program"],
    })

    // Get outcomes
    const outcomes = await this.outcomeRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })

    const recentOutcomes = outcomes.filter((o) => o.createdAt >= startDate)

    return {
      period: `${days} days`,
      meditation: {
        totalSessions: recentSessions.length,
        totalMinutes: recentSessions.reduce((sum, s) => sum + s.actualDurationMinutes, 0),
        averageSessionLength:
          recentSessions.length > 0
            ? Math.round(recentSessions.reduce((sum, s) => sum + s.actualDurationMinutes, 0) / recentSessions.length)
            : 0,
        programsActive: progress.filter((p) => p.status === "in_progress").length,
        programsCompleted: progress.filter((p) => p.status === "completed").length,
      },
      mood: {
        totalEntries: recentMoods.length,
        averageMood:
          recentMoods.length > 0
            ? Math.round((recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length) * 100) / 100
            : 0,
        averageStress:
          recentMoods.length > 0
            ? Math.round((recentMoods.reduce((sum, m) => sum + m.stress, 0) / recentMoods.length) * 100) / 100
            : 0,
        averageEnergy:
          recentMoods.length > 0
            ? Math.round((recentMoods.reduce((sum, m) => sum + m.energy, 0) / recentMoods.length) * 100) / 100
            : 0,
      },
      outcomes: {
        totalMeasurements: recentOutcomes.length,
        averageImprovement:
          recentOutcomes.length > 0
            ? Math.round((recentOutcomes.reduce((sum, o) => sum + o.improvement, 0) / recentOutcomes.length) * 100) /
              100
            : 0,
        byType: this.groupOutcomesByType(recentOutcomes),
      },
      trends: {
        moodTrend: this.calculateMoodTrend(recentMoods),
        sessionFrequency: this.calculateSessionFrequency(recentSessions),
        improvementTrend: this.calculateImprovementTrend(recentOutcomes),
      },
    }
  }

  private groupOutcomesByType(outcomes: WellnessOutcome[]): Record<string, any> {
    const grouped = outcomes.reduce(
      (acc, outcome) => {
        if (!acc[outcome.outcomeType]) {
          acc[outcome.outcomeType] = []
        }
        acc[outcome.outcomeType].push(outcome)
        return acc
      },
      {} as Record<string, WellnessOutcome[]>,
    )

    return Object.entries(grouped).reduce(
      (acc, [type, typeOutcomes]) => {
        acc[type] = {
          count: typeOutcomes.length,
          averageImprovement: typeOutcomes.reduce((sum, o) => sum + o.improvement, 0) / typeOutcomes.length,
          latestScore: typeOutcomes[0]?.afterScore || 0,
        }
        return acc
      },
      {} as Record<string, any>,
    )
  }

  private calculateMoodTrend(moods: MoodEntry[]): string {
    if (moods.length < 2) return "insufficient_data"

    const sortedMoods = moods.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const halfPoint = Math.floor(sortedMoods.length / 2)

    const firstHalf = sortedMoods.slice(0, halfPoint)
    const secondHalf = sortedMoods.slice(halfPoint)

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.mood, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.mood, 0) / secondHalf.length

    const difference = secondAvg - firstAvg

    if (difference > 0.5) return "improving"
    if (difference < -0.5) return "declining"
    return "stable"
  }

  private calculateSessionFrequency(sessions: MeditationSession[]): string {
    if (sessions.length === 0) return "none"

    const days = 30
    const frequency = sessions.length / days

    if (frequency >= 1) return "daily"
    if (frequency >= 0.5) return "frequent"
    if (frequency >= 0.25) return "moderate"
    return "occasional"
  }

  private calculateImprovementTrend(outcomes: WellnessOutcome[]): string {
    if (outcomes.length < 3) return "insufficient_data"

    const sortedOutcomes = outcomes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const recentImprovements = sortedOutcomes.slice(-5).map((o) => o.improvement)

    let increasingCount = 0
    for (let i = 1; i < recentImprovements.length; i++) {
      if (recentImprovements[i] > recentImprovements[i - 1]) {
        increasingCount++
      }
    }

    const improvementRatio = increasingCount / (recentImprovements.length - 1)

    if (improvementRatio >= 0.7) return "strong_improvement"
    if (improvementRatio >= 0.4) return "moderate_improvement"
    if (improvementRatio >= 0.2) return "slight_improvement"
    return "plateau"
  }

  async getPopularPrograms(): Promise<any[]> {
    const programStats = await this.progressRepository
      .createQueryBuilder("progress")
      .select("progress.programId", "programId")
      .addSelect("COUNT(*)", "userCount")
      .addSelect("AVG(progress.completionPercentage)", "avgCompletion")
      .addSelect("AVG(progress.totalMinutesSpent)", "avgMinutes")
      .leftJoin("progress.program", "program")
      .addSelect("program.title", "title")
      .addSelect("program.type", "type")
      .groupBy("progress.programId")
      .addGroupBy("program.title")
      .addGroupBy("program.type")
      .orderBy("userCount", "DESC")
      .limit(10)
      .getRawMany()

    return programStats.map((stat) => ({
      programId: stat.programId,
      title: stat.title,
      type: stat.type,
      userCount: Number.parseInt(stat.userCount),
      averageCompletion: Math.round(Number.parseFloat(stat.avgCompletion) * 100) / 100,
      averageMinutes: Math.round(Number.parseFloat(stat.avgMinutes) * 100) / 100,
    }))
  }
}
