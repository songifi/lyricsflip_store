import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PerformanceRight } from '../entities/performance.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PerformanceRight)
    private performanceRepo: Repository<PerformanceRight>,
  ) {}

  async getRevenueByType() {
    const performances = await this.performanceRepo.find();
    const analytics = {};

    for (const p of performances) {
      if (!analytics[p.type]) {
        analytics[p.type] = 0;
      }
      analytics[p.type] += Number(p.revenue);
    }

    return analytics;
  }
}
