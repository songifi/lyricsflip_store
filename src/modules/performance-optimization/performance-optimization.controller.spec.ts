import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceOptimizationController } from './performance-optimization.controller';
import { PerformanceOptimizationService } from './performance-optimization.service';

describe('PerformanceOptimizationController', () => {
  let controller: PerformanceOptimizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceOptimizationController],
      providers: [PerformanceOptimizationService],
    }).compile();

    controller = module.get<PerformanceOptimizationController>(PerformanceOptimizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
