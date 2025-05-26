import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Contest } from "./entities/contest.entity"
import { ContestSubmission } from "./entities/contest-submission.entity"
import { ContestVote } from "./entities/contest-vote.entity"
import { ContestPrize } from "./entities/contest-prize.entity"
import { ContestJury } from "./entities/contest-jury.entity"
import { ContestService } from "./services/contest.service"
import { SubmissionService } from "./services/submission.service"
import { VotingService } from "./services/voting.service"
import { PrizeService } from "./services/prize.service"
import { ContestController } from "./controllers/contest.controller"
import { SubmissionController } from "./controllers/submission.controller"
import { VotingController } from "./controllers/voting.controller"
import { PrizeController } from "./controllers/prize.controller"
import { ContestSchedulerService } from "./services/contest-scheduler.service"
import { Track } from "../music/tracks/entities/track.entity"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Contest, ContestSubmission, ContestVote, ContestPrize, ContestJury, Track]),
    NotificationsModule,
  ],
  controllers: [ContestController, SubmissionController, VotingController, PrizeController],
  providers: [ContestService, SubmissionService, VotingService, PrizeService, ContestSchedulerService],
  exports: [ContestService, SubmissionService, VotingService, PrizeService],
})
export class ContestsModule {}
