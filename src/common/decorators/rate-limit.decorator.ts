import { SetMetadata } from "@nestjs/common"

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: any) => string
  message?: string
}

export const RATE_LIMIT_KEY = "rate_limit"

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options)

// Predefined rate limit configurations
export const RateLimitConfigs = {
  STREAMING: { windowMs: 60000, max: 100 }, // 100 requests per minute
  UPLOAD: { windowMs: 300000, max: 10 }, // 10 uploads per 5 minutes
  SEARCH: { windowMs: 60000, max: 200 }, // 200 searches per minute
  AUTH: { windowMs: 900000, max: 5 }, // 5 auth attempts per 15 minutes
  GENERAL: { windowMs: 60000, max: 1000 }, // 1000 requests per minute
  DEVELOPER_API: { windowMs: 3600000, max: 10000 }, // 10k requests per hour
}
