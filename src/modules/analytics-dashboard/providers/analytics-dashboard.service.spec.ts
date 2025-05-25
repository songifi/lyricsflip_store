import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsDashboardService } from './analytics-dashboard.service';

describe('AnalyticsDashboardService', () => {
  let service: AnalyticsDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsDashboardService],
    }).compile();

    service = module.get<AnalyticsDashboardService>(AnalyticsDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
