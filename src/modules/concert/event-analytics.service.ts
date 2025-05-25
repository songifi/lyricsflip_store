// src/event-analytics/event-analytics.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventAnalytics } from '../entities/event-analytics.entity';
import { CreateEventAnalyticsDto, UpdateEventAnalyticsDto } from './dto';

@Injectable()
export class EventAnalyticsService {
  constructor(
    @InjectRepository(EventAnalytics)
    private readonly analyticsRepo: Repository<EventAnalytics>,
  ) {}

  async create(data: CreateEventAnalyticsDto): Promise<EventAnalytics> {
    const newRecord = this.analyticsRepo.create(data);
    return this.analyticsRepo.save(newRecord);
  }

  async findAll(): Promise<EventAnalytics[]> {
    return this.analyticsRepo.find({ relations: ['event'] });
  }

  async findOne(id: string): Promise<EventAnalytics> {
    const record = await this.analyticsRepo.findOne({ where: { id }, relations: ['event'] });
    if (!record) throw new NotFoundException(`Event Analytics record ${id} not found`);
    return record;
  }

  async update(id: string, data: UpdateEventAnalyticsDto): Promise<EventAnalytics> {
    const existing = await this.findOne(id);
    Object.assign(existing, data);
    return this.analyticsRepo.save(existing);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.analyticsRepo.remove(existing);
  }
}
