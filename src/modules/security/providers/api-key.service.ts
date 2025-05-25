import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type ApiKey, ApiKeyStatus, type ApiKeyScope } from "../entities/api-key.entity"
import * as crypto from "crypto"
import * as bcrypt from "bcrypt"

export interface CreateApiKeyDto {
  name: string
  description?: string
  scopes: ApiKeyScope[]
  rateLimits?: {
    windowMs: number
    max: number
  }
  allowedIps?: string[]
  expiresAt?: Date
  userId: string
}

export interface ApiKeyValidationResult {
  isValid: boolean
  apiKey?: ApiKey
  reason?: string
}

@Injectable()
export class ApiKeyService {
  constructor(private apiKeyRepository: Repository<ApiKey>) {}

  async createApiKey(createDto: CreateApiKeyDto): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = this.generateApiKey()
    const hashedKey = await bcrypt.hash(plainKey, 10)

    const apiKey = this.apiKeyRepository.create({
      ...createDto,
      key: hashedKey,
    })

    const savedApiKey = await this.apiKeyRepository.save(apiKey)

    return {
      apiKey: savedApiKey,
      plainKey: `mk_${plainKey}`, // Music platform prefix
    }
  }

  async validateApiKey(providedKey: string, requiredScopes?: ApiKeyScope[]): Promise<ApiKeyValidationResult> {
    if (!providedKey.startsWith("mk_")) {
      return { isValid: false, reason: "Invalid API key format" }
    }

    const cleanKey = providedKey.replace("mk_", "")
    const apiKeys = await this.apiKeyRepository.find({
      where: { status: ApiKeyStatus.ACTIVE },
      relations: ["user"],
    })

    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(cleanKey, apiKey.key)

      if (isMatch) {
        // Check expiration
        if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
          return { isValid: false, reason: "API key expired" }
        }

        // Check scopes
        if (requiredScopes && !this.hasRequiredScopes(apiKey.scopes, requiredScopes)) {
          return { isValid: false, reason: "Insufficient permissions" }
        }

        // Update usage
        await this.updateUsage(apiKey.id)

        return { isValid: true, apiKey }
      }
    }

    return { isValid: false, reason: "Invalid API key" }
  }

  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: keyId, userId },
    })

    if (!apiKey) {
      throw new NotFoundException("API key not found")
    }

    apiKey.status = ApiKeyStatus.REVOKED
    await this.apiKeyRepository.save(apiKey)
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      select: ["id", "name", "description", "status", "scopes", "createdAt", "lastUsedAt", "usageCount"],
    })
  }

  private generateApiKey(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  private hasRequiredScopes(userScopes: ApiKeyScope[], requiredScopes: ApiKeyScope[]): boolean {
    return requiredScopes.every((scope) => userScopes.includes(scope))
  }

  private async updateUsage(keyId: string): Promise<void> {
    await this.apiKeyRepository.update(keyId, {
      lastUsedAt: new Date(),
      usageCount: () => "usage_count + 1",
    })
  }
}
