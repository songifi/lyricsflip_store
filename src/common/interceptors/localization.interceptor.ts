import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"
import type { I18nService } from "../../modules/i18n/services/i18n.service"
import type { CurrencyService } from "../../modules/i18n/services/currency.service"

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  constructor(
    private i18nService: I18nService,
    private currencyService: CurrencyService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    // Set localization context in request
    request.localizationContext = {
      language: request.query?.lang || "en",
      region: request.query?.region || request.headers["cf-ipcountry"],
      userId: request.user?.id,
    }

    // Set appropriate headers
    response.setHeader("Content-Language", request.localizationContext.language)

    return next.handle().pipe(
      map((data) => {
        // Add localization metadata to response
        if (data && typeof data === "object") {
          data._localization = {
            language: request.localizationContext.language,
            region: request.localizationContext.region,
            timestamp: new Date().toISOString(),
          }
        }
        return data
      }),
    )
  }
}
