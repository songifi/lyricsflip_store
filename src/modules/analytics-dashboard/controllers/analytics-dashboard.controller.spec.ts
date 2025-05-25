import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsDashboardController } from './analytics-dashboard.controller';
import { AnalyticsDashboardService } from './analytics-dashboard.service';

describe('AnalyticsDashboardController', () => {
  let controller: AnalyticsDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsDashboardController],
      providers: [AnalyticsDashboardService],
    }).compile();

    controller = module.get<AnalyticsDashboardController>(AnalyticsDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
