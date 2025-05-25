import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import type { LocalizationContext } from "../../modules/i18n/services/i18n.service"

export const Localized = createParamDecorator((data: unknown, ctx: ExecutionContext): LocalizationContext => {
  const request = ctx.switchToHttp().getRequest()

  // Extract language from various sources
  const language =
    request.query?.lang ||
    request.headers["x-custom-lang"] ||
    request.headers["accept-language"]?.split(",")[0]?.split("-")[0] ||
    "en"

  // Extract region from headers or query
  const region =
    request.query?.region ||
    request.headers["x-user-region"] ||
    request.headers["cf-ipcountry"] || // Cloudflare country header
    undefined

  // Extract user ID if authenticated
  const userId = request.user?.id

  return {
    language: language.toLowerCase(),
    region: region?.toUpperCase(),
    userId,
  }
})
