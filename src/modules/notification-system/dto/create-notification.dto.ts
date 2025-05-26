export class CreateNotificationDto {
  title: string;
  message: string;
  type: 'release' | 'event' | 'social' | 'system';
  metadata?: Record<string, any>;
  scheduledAt?: Date;
}