import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { ContestService } from "./contest.service"
import type { SubmissionService } from "./submission.service"
import type { PrizeService } from "./prize.service"

@Injectable()
export class ContestSchedulerService {
  private readonly logger = new Logger(ContestSchedulerService.name)

  constructor(
    private contestService: ContestService,
    private submissionService: SubmissionService,
    private prizeService: PrizeService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateContestStatuses() {
    try {
      await this.contestService.updateStatus()
      this.logger.debug("Contest statuses updated")
    } catch (error) {
      this.logger.error("Failed to update contest statuses", error)
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async calculateRankings() {
    try {
      // Get all active voting contests and update rankings
      const activeContests = await this.contestService.getActiveContests()

      for (const contest of activeContests) {
        await this.submissionService.calculateRankings(contest.id)
      }

      this.logger.debug("Contest rankings updated")
    } catch (error) {
      this.logger.error("Failed to update contest rankings", error)
    }
  }

  @Cron("0 0 * * *") // Daily at midnight
  async processCompletedContests() {
    try {
      // Auto-award prizes for completed contests
      const completedContests = await this.contestService.findAll({ page: 1, limit: 100 }, { status: "completed" })

      for (const contest of completedContests.contests) {
        try {
          await this.prizeService.awardPrizes(contest.id)
        } catch (error) {
          this.logger.warn(`Failed to award prizes for contest ${contest.id}`, error)
        }
      }

      this.logger.debug("Completed contests processed")
    } catch (error) {
      this.logger.error("Failed to process completed contests", error)
    }
  }
}
