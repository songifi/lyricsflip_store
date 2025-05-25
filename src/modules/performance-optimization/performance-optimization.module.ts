import { Module } from '@nestjs/common';
import { PerformanceOptimizationService } from './performance-optimization.service';
import { PerformanceOptimizationController } from './performance-optimization.controller';

@Module({
  controllers: [PerformanceOptimizationController],
  providers: [PerformanceOptimizationService],
})
export class PerformanceOptimizationModule {}
