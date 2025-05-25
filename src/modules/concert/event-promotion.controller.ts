// src/event-promotion/event-promotion.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { EventPromotionService } from './event-promotion.service';
import { CreateEventPromotionDto, UpdateEventPromotionDto } from './dto';

@Controller('event-promotions')
export class EventPromotionController {
  constructor(private readonly service: EventPromotionService) {}

  @Post()
  create(@Body() dto: CreateEventPromotionDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateEventPromotionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
