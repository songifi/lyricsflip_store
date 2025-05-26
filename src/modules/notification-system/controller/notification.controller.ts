import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from '../service/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { ScheduleNotificationDto } from '../dto/schedule-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.createNotification(dto);
  }

  @Post('preferences')
  updatePreferences(@Body() dto: UpdatePreferencesDto) {
    // update preferences
  }

  @Post('schedule')
  schedule(@Body() dto: ScheduleNotificationDto) {
    return this.service.createNotification(dto); // includes scheduledAt
  }
}