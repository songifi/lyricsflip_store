// src/event-analytics/event-analytics.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { EventAnalyticsService } from './event-analytics.service';
import { CreateEventAnalyticsDto, UpdateEventAnalyticsDto } from './dto';

@Controller('event-analytics')
export class EventAnalyticsController {
  constructor(private readonly service: EventAnalyticsService) {}

  @Post()
  create(@Body() dto: CreateEventAnalyticsDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventAnalyticsDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
