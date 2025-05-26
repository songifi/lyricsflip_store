import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TasteProfileService } from '../services/taste-profile.service';
import { CreateTasteProfileDto } from '../dto/create-taste-profile.dto';

@Controller('taste-profile')
export class TasteProfileController {
  constructor(private readonly service: TasteProfileService) {}

  @Post(':userId')
  updateProfile(@Param('userId') userId: string, @Body() dto: CreateTasteProfileDto) {
    return this.service.createOrUpdate(userId, dto);
  }

  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.service.getByUserId(userId);
  }
}
