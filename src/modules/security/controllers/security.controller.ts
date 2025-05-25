import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from "@nestjs/common"
import type { Request } from "express"
import type { ApiKeyService, CreateApiKeyDto } from "../services/api-key.service"
import type { SecurityMonitoringService } from "../services/monitoring.service"
import { RateLimit, RateLimitConfigs } from "../../../common/decorators/rate-limit.decorator"
import { RateLimitGuard } from "../../../common/guards/rate-limit.guard"
import { ApiKeyGuard, RequireApiKeyScopes } from "../../../common/guards/api-key.guard"
import { ApiKeyScope } from "../entities/api-key.entity"

@Controller("security")
@UseGuards(RateLimitGuard)
export class SecurityController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly monitoringService: SecurityMonitoringService,
  ) {}

  @Post("api-keys")
  @RateLimit(RateLimitConfigs.GENERAL)
  @UseGuards(ApiKeyGuard)
  @RequireApiKeyScopes(ApiKeyScope.ADMIN)
  async createApiKey(@Body() createDto: CreateApiKeyDto, @Req() req: Request): Promise<any> {
    const result = await this.apiKeyService.createApiKey({
      ...createDto,
      userId: req.user.id,
    })

    return {
      id: result.apiKey.id,
      name: result.apiKey.name,
      key: result.plainKey, // Only returned once
      scopes: result.apiKey.scopes,
      createdAt: result.apiKey.createdAt,
    }
  }

  @Get('api-keys')
  @RateLimit(RateLimitConfigs.GENERAL)
  @UseGuards(ApiKeyGuard)
  @RequireApiKeyScopes(ApiKeyScope.READ)
  async getUserApiKeys(@Req() req: Request) {
    return this.apiKeyService.getUserApiKeys(req.user.id);
  }

  @Delete("api-keys/:keyId")
  @RateLimit(RateLimitConfigs.GENERAL)
  @UseGuards(ApiKeyGuard)
  @RequireApiKeyScopes(ApiKeyScope.ADMIN)
  async revokeApiKey(@Param('keyId') keyId: string, @Req() req: Request) {
    await this.apiKeyService.revokeApiKey(keyId, req.user.id)
    return { message: "API key revoked successfully" }
  }

  @Get('metrics')
  @RateLimit(RateLimitConfigs.GENERAL)
  @UseGuards(ApiKeyGuard)
  @RequireApiKeyScopes(ApiKeyScope.ADMIN)
  async getSecurityMetrics(@Query('range') range: '1h' | '24h' | '7d' = '24h') {
    return this.monitoringService.getSecurityMetrics(range);
  }

  @Get('alerts')
  @RateLimit(RateLimitConfigs.GENERAL)
  @UseGuards(ApiKeyGuard)
  @RequireApiKeyScopes(ApiKeyScope.ADMIN)
  async getSecurityAlerts(@Query('limit') limit: number = 50) {
    return this.monitoringService.getRecentAlerts(limit);
  }
}
