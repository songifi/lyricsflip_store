import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ModerationController } from "./moderation.controller"
import { ModerationService } from "./moderation.service"
import { ContentScanningService } from "./services/content-scanning.service"
import { ModerationWorkflowService } from "./services/moderation-workflow.service"
import { ModerationAnalyticsService } from "./services/moderation-analytics.service"
import { UserFlaggingService } from "./services/user-flagging.service"
import { AppealService } from "./services/appeal.service"
import { ModerationTeamService } from "./services/moderation-team.service"
import {
  ModerationCase,
  ContentFlag,
  ModerationAction,
  Appeal,
  ModerationTeamMember,
  ModerationRule,
  ModerationAnalytics,
} from "./entities"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModerationCase,
      ContentFlag,
      ModerationAction,
      Appeal,
      ModerationTeamMember,
      ModerationRule,
      ModerationAnalytics,
    ]),
  ],
  controllers: [ModerationController],
  providers: [
    ModerationService,
    ContentScanningService,
    ModerationWorkflowService,
    ModerationAnalyticsService,
    UserFlaggingService,
    AppealService,
    ModerationTeamService,
  ],
  exports: [ModerationService, ContentScanningService, ModerationWorkflowService],
})
export class ModerationModule {}
