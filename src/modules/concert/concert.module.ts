// src/concert/concert.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { EventPromotion } from '../entities/event-promotion.entity';
import { EventPromotionService } from './event-promotion.service';
import { EventPromotionController } from './event-promotion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventPromotion])],
  controllers: [EventPromotionController],
  providers: [EventPromotionService],
  exports: [EventPromotionService],
})
export class ConcertModule {}
