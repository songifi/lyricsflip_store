import { PartialType } from '@nestjs/swagger';
import { CreatePerformanceOptimizationDto } from './create-performance-optimization.dto';

export class UpdatePerformanceOptimizationDto extends PartialType(CreatePerformanceOptimizationDto) {}
