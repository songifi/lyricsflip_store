import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler, Logger } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"
import type { PerformanceMonitoringService } from "../services/performance-monitoring.service"

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name)

  constructor(private performanceMonitoringService: PerformanceMonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now()
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now()
        const responseTime = endTime - startTime

        // Record performance metrics
        this.performanceMonitoringService.recordMetric({
          endpoint: request.route?.path || request.url,
          method: request.method,
          responseTime,
          statusCode: response.statusCode,
        })

        // Log slow requests
        if (responseTime > 1000) {
          this.logger.warn(`Slow request detected: ${request.method} ${request.url} - ${responseTime}ms`)
        }
      }),
    )
  }
}
