import { Injectable, type CanActivate, type ExecutionContext, HttpException, HttpStatus } from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import type { Redis } from "ioredis"
import { InjectRedis } from "@nestjs-modules/ioredis"
import { RATE_LIMIT_KEY, type RateLimitOptions } from "../decorators/rate-limit.decorator"

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly redis: Redis

  constructor(
    private reflector: Reflector,
    @InjectRedis() redis: Redis,
  ) {
    this.redis = redis
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!rateLimitOptions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const key = this.generateKey(request, rateLimitOptions)

    const current = await this.redis.incr(key)

    if (current === 1) {
      await this.redis.expire(key, Math.ceil(rateLimitOptions.windowMs / 1000))
    }

    if (current > rateLimitOptions.max) {
      const ttl = await this.redis.ttl(key)

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitOptions.message || "Too many requests",
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse()
    response.setHeader("X-RateLimit-Limit", rateLimitOptions.max)
    response.setHeader("X-RateLimit-Remaining", Math.max(0, rateLimitOptions.max - current))
    response.setHeader("X-RateLimit-Reset", new Date(Date.now() + (await this.redis.ttl(key)) * 1000))

    return true
  }

  private generateKey(request: any, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request)
    }

    const ip = request.ip || request.connection.remoteAddress
    const userId = request.user?.id || "anonymous"
    const endpoint = `${request.method}:${request.route?.path || request.url}`

    return `rate_limit:${ip}:${userId}:${endpoint}`
  }
}
