import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerformanceOptimizationService } from './performance-optimization.service';
import { CreatePerformanceOptimizationDto } from './dto/create-performance-optimization.dto';
import { UpdatePerformanceOptimizationDto } from './dto/update-performance-optimization.dto';

@Controller('performance-optimization')
export class PerformanceOptimizationController {
  constructor(private readonly performanceOptimizationService: PerformanceOptimizationService) {}

  @Post()
  create(@Body() createPerformanceOptimizationDto: CreatePerformanceOptimizationDto) {
    return this.performanceOptimizationService.create(createPerformanceOptimizationDto);
  }

  @Get()
  findAll() {
    return this.performanceOptimizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.performanceOptimizationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerformanceOptimizationDto: UpdatePerformanceOptimizationDto) {
    return this.performanceOptimizationService.update(+id, updatePerformanceOptimizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.performanceOptimizationService.remove(+id);
  }
}
