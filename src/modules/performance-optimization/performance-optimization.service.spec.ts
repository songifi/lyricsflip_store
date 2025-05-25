import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceOptimizationService } from './performance-optimization.service';

describe('PerformanceOptimizationService', () => {
  let service: PerformanceOptimizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceOptimizationService],
    }).compile();

    service = module.get<PerformanceOptimizationService>(PerformanceOptimizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
