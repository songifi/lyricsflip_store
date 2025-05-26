import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private logs: any[] = [];

  logEvent(event: string, data: any) {
    this.logs.push({ event, data, timestamp: new Date() });
  }

  getAnalytics() {
    return this.logs;
  }
}