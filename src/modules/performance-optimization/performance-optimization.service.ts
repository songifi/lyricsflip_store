import { Injectable } from '@nestjs/common';
import { CreatePerformanceOptimizationDto } from './dto/create-performance-optimization.dto';
import { UpdatePerformanceOptimizationDto } from './dto/update-performance-optimization.dto';

@Injectable()
export class PerformanceOptimizationService {
  create(createPerformanceOptimizationDto: CreatePerformanceOptimizationDto) {
    return 'This action adds a new performanceOptimization';
  }

  findAll() {
    return `This action returns all performanceOptimization`;
  }

  findOne(id: number) {
    return `This action returns a #${id} performanceOptimization`;
  }

  update(id: number, updatePerformanceOptimizationDto: UpdatePerformanceOptimizationDto) {
    return `This action updates a #${id} performanceOptimization`;
  }

  remove(id: number) {
    return `This action removes a #${id} performanceOptimization`;
  }
}
