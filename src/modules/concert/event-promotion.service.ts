// src/event-promotion/event-promotion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPromotion } from '../entities/event-promotion.entity';
import { CreateEventPromotionDto, UpdateEventPromotionDto } from './dto';

@Injectable()
export class EventPromotionService {
  constructor(
    @InjectRepository(EventPromotion)
    private readonly promoRepo: Repository<EventPromotion>,
  ) {}

  async create(data: CreateEventPromotionDto): Promise<EventPromotion> {
    const promo = this.promoRepo.create(data);
    return this.promoRepo.save(promo);
  }

  async findAll(): Promise<EventPromotion[]> {
    return this.promoRepo.find({ relations: ['event'] });
  }

  async findOne(id: string): Promise<EventPromotion> {
    const promo = await this.promoRepo.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!promo) throw new NotFoundException(`Promotion with ID ${id} not found`);

    return promo;
  }

  async update(id: string, data: UpdateEventPromotionDto): Promise<EventPromotion> {
    const promo = await this.findOne(id);
    Object.assign(promo, data);
    return this.promoRepo.save(promo);
  }

  async remove(id: string): Promise<void> {
    const promo = await this.findOne(id);
    await this.promoRepo.remove(promo);
  }
}
