// src/event-checkin/event-checkin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCheckIn } from '../entities/event-checkin.entity';
import { CreateEventCheckInDto, UpdateEventCheckInDto } from './dto';

@Injectable()
export class EventCheckInService {
  constructor(
    @InjectRepository(EventCheckIn)
    private readonly checkInRepo: Repository<EventCheckIn>,
  ) {}

  async create(data: CreateEventCheckInDto): Promise<EventCheckIn> {
    const checkIn = this.checkInRepo.create(data);
    return this.checkInRepo.save(checkIn);
  }

  async findAll(): Promise<EventCheckIn[]> {
    return this.checkInRepo.find({
      relations: ['event', 'ticket'],
    });
  }

  async findOne(id: string): Promise<EventCheckIn> {
    const checkIn = await this.checkInRepo.findOne({
      where: { id },
      relations: ['event', 'ticket'],
    });

    if (!checkIn) {
      throw new NotFoundException(`Check-in record with ID ${id} not found`);
    }

    return checkIn;
  }

  async update(id: string, data: UpdateEventCheckInDto): Promise<EventCheckIn> {
    const existing = await this.findOne(id);
    Object.assign(existing, data);
    return this.checkInRepo.save(existing);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.checkInRepo.remove(existing);
  }
}
