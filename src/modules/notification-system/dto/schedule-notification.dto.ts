export class ScheduleNotificationDto {
  title: string;
  message: string;
  type: 'release' | 'event' | 'social' | 'system';
  scheduledAt: Date;
}