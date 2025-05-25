// src/event-checkin/event-checkin.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { EventCheckInService } from './event-checkin.service';
import { CreateEventCheckInDto, UpdateEventCheckInDto } from './dto';

@Controller('event-checkins')
export class EventCheckInController {
  constructor(private readonly service: EventCheckInService) {}

  @Post()
  create(@Body() dto: CreateEventCheckInDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateEventCheckInDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
