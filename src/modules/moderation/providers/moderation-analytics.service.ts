import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Between } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { ModerationAnalytics } from "../entities/moderation-analytics.entity"
import { ModerationCase, ModerationStatus, ContentType, ViolationType } from "../entities/moderation-case.entity"

@Injectable()
export class ModerationAnalyticsService {
  private readonly logger = new Logger(ModerationAnalyticsService.name);

  constructor(
    @InjectRepository(ModerationAnalytics)
    private analyticsRepository: Repository<ModerationAnalytics>,
    @InjectRepository(ModerationCase)
    private moderationCaseRepository: Repository<ModerationCase>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyAnalytics(): Promise<void> {
    this.logger.log("Generating daily moderation analytics")

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Generate overall analytics
    await this.generateAnalyticsForPeriod(yesterday, today)

    // Generate analytics by content type
    for (const contentType of Object.values(ContentType)) {
      await this.generateAnalyticsForPeriod(yesterday, today, contentType)
    }

    // Generate analytics by violation type
    for (const violationType of Object.values(ViolationType)) {
      await this.generateAnalyticsForPeriod(yesterday, today, undefined, violationType)
    }
  }

  private async generateAnalyticsForPeriod(
    startDate: Date,
    endDate: Date,
    contentType?: ContentType,
    violationType?: ViolationType,
  ): Promise<void> {
    const query = this.moderationCaseRepository
      .createQueryBuilder("case")
      .where("case.createdAt >= :startDate AND case.createdAt < :endDate", {
        startDate,
        endDate,
      })

    if (contentType) {
      query.andWhere("case.contentType = :contentType", { contentType })
    }

    if (violationType) {
      query.andWhere(":violationType = ANY(case.violationTypes)", { violationType })
    }

    const cases = await query.getMany()

    const analytics = {
      date: startDate,
      contentType,
      violationType,
      totalCases: cases.length,
      automatedCases: cases.filter((c) => c.isAutomated).length,
      manualCases: cases.filter((c) => !c.isAutomated).length,
      approvedCases: cases.filter((c) => c.status === ModerationStatus.APPROVED).length,
      rejectedCases: cases.filter((c) => c.status === ModerationStatus.REJECTED).length,
      appealedCases: cases.filter((c) => c.status === ModerationStatus.APPEALED).length,
      averageProcessingTime: this.calculateAverageProcessingTime(cases),
      accuracyRate: this.calculateAccuracyRate(cases),
    }

    await this.analyticsRepository.save(analytics)
  }

  private calculateAverageProcessingTime(cases: ModerationCase[]): number {
    const resolvedCases = cases.filter((c) => c.resolvedAt)
    if (resolvedCases.length === 0) return 0

    const totalTime = resolvedCases.reduce((sum, c) => {
      const processingTime = c.resolvedAt.getTime() - c.createdAt.getTime()
      return sum + processingTime
    }, 0)

    return totalTime / resolvedCases.length / (1000 * 60 * 60) // Convert to hours
  }

  private calculateAccuracyRate(cases: ModerationCase[]): number {
    const automatedCases = cases.filter((c) => c.isAutomated && c.resolvedAt)
    if (automatedCases.length === 0) return 0

    // This is a simplified accuracy calculation
    // In practice, you'd need to track manual reviews of automated decisions
    const correctDecisions = automatedCases.filter((c) => c.confidenceScore > 0.8).length
    return (correctDecisions / automatedCases.length) * 100
  }

  async getAnalytics(
    startDate: Date,
    endDate: Date,
    contentType?: ContentType,
    violationType?: ViolationType,
  ): Promise<ModerationAnalytics[]> {
    const query = this.analyticsRepository
      .createQueryBuilder("analytics")
      .where("analytics.date >= :startDate AND analytics.date <= :endDate", {
        startDate,
        endDate,
      })

    if (contentType) {
      query.andWhere("analytics.contentType = :contentType", { contentType })
    }

    if (violationType) {
      query.andWhere("analytics.violationType = :violationType", { violationType })
    }

    return query.orderBy("analytics.date", "ASC").getMany()
  }

  async getDashboardMetrics(): Promise<any> {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const [totalCases, pendingCases, resolvedCases, averageProcessingTime] = await Promise.all([
      this.moderationCaseRepository.count({
        where: { createdAt: Between(thirtyDaysAgo, today) },
      }),
      this.moderationCaseRepository.count({
        where: {
          status: ModerationStatus.PENDING,
          createdAt: Between(thirtyDaysAgo, today),
        },
      }),
      this.moderationCaseRepository.count({
        where: {
          status: ModerationStatus.RESOLVED,
          createdAt: Between(thirtyDaysAgo, today),
        },
      }),
      this.getAverageProcessingTimeForPeriod(thirtyDaysAgo, today),
    ])

    return {
      totalCases,
      pendingCases,
      resolvedCases,
      averageProcessingTime,
      resolutionRate: totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0,
    }
  }

  private async getAverageProcessingTimeForPeriod(startDate: Date, endDate: Date): Promise<number> {
    const cases = await this.moderationCaseRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        resolvedAt: Between(startDate, endDate),
      },
    })

    return this.calculateAverageProcessingTime(cases)
  }
}
