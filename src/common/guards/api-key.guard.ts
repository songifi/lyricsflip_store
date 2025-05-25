import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import type { ApiKeyService } from "../../modules/security/services/api-key.service"
import type { ApiKeyScope } from "../../modules/security/entities/api-key.entity"

export const API_KEY_SCOPES = "api_key_scopes"
export const RequireApiKeyScopes = (...scopes: ApiKeyScope[]) => Reflect.metadata(API_KEY_SCOPES, scopes)

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiKeyService: ApiKeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const apiKey = this.extractApiKey(request)

    if (!apiKey) {
      throw new UnauthorizedException("API key required")
    }

    const requiredScopes = this.reflector.getAllAndOverride<ApiKeyScope[]>(API_KEY_SCOPES, [
      context.getHandler(),
      context.getClass(),
    ])

    const validation = await this.apiKeyService.validateApiKey(apiKey, requiredScopes)

    if (!validation.isValid) {
      throw new UnauthorizedException(validation.reason)
    }

    request.apiKey = validation.apiKey
    request.user = validation.apiKey.user

    return true
  }

  private extractApiKey(request: any): string | null {
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }

    return request.headers["x-api-key"] || request.query.api_key || null
  }
}
