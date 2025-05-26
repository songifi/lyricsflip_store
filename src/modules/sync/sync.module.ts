import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SyncLicense } from "../../database/entities/sync-license.entity"
import { MediaProject } from "../../database/entities/media-project.entity"
import { SyncClient } from "../../database/entities/sync-client.entity"
import { UsageReport } from "../../database/entities/usage-report.entity"
import { SyncOpportunity } from "../../database/entities/sync-opportunity.entity"
import { SyncFeeCalculation } from "../../database/entities/sync-fee-calculation.entity"
import { SyncController } from "./sync.controller"
import { SyncService } from "./sync.service"
import { SyncWorkflowService } from "./services/sync-workflow.service"
import { SyncFeeService } from "./services/sync-fee.service"
import { SyncMatchingService } from "./services/sync-matching.service"
import { SyncAnalyticsService } from "./services/sync-analytics.service"
import { UsageTrackingService } from "./services/usage-tracking.service"
import { MediaProjectController } from "./controllers/media-project.controller"
import { SyncClientController } from "./controllers/sync-client.controller"
import { SyncOpportunityController } from "./controllers/sync-opportunity.controller"
import { MediaProjectService } from "./services/media-project.service"
import { SyncClientService } from "./services/sync-client.service"
import { SyncOpportunityService } from "./services/sync-opportunity.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncLicense, MediaProject, SyncClient, UsageReport, SyncOpportunity, SyncFeeCalculation]),
  ],
  controllers: [SyncController, MediaProjectController, SyncClientController, SyncOpportunityController],
  providers: [
    SyncService,
    SyncWorkflowService,
    SyncFeeService,
    SyncMatchingService,
    SyncAnalyticsService,
    UsageTrackingService,
    MediaProjectService,
    SyncClientService,
    SyncOpportunityService,
  ],
  exports: [
    SyncService,
    SyncWorkflowService,
    SyncFeeService,
    SyncMatchingService,
    SyncAnalyticsService,
    UsageTrackingService,
  ],
})
export class SyncModule {}
