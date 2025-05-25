import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApiKey } from "./entities/api-key.entity"
import { ApiKeyService } from "./services/api-key.service"
import { DrmService } from "./services/drm.service"
import { AbuseDetectionService } from "./services/abuse-detection.service"
import { SecurityMonitoringService } from "./services/monitoring.service"
import { SecurityController } from "./controllers/security.controller"
import { RateLimitGuard } from "../../common/guards/rate-limit.guard"
import { ApiKeyGuard } from "../../common/guards/api-key.guard"

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [ApiKeyService, DrmService, AbuseDetectionService, SecurityMonitoringService, RateLimitGuard, ApiKeyGuard],
  controllers: [SecurityController],
  exports: [ApiKeyService, DrmService, AbuseDetectionService, SecurityMonitoringService, RateLimitGuard, ApiKeyGuard],
})
export class SecurityModule {}
