import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from '../entity/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PushService } from './push.service';
import { EmailService } from './email.service';
import { AnalyticsService } from './analytics.service';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly push: PushService,
    private readonly email: EmailService,
    private readonly analytics: AnalyticsService,
    private readonly scheduler: SchedulerService,
  ) {}

  async createNotification(dto: any) {
    const notif = this.repo.create(dto);
    if (dto.scheduledAt) {
      await this.scheduler.scheduleNotification(notif);
    } else {
      await this.sendNotification(notif);
    }
    return this.repo.save(notif);
  }

  async sendNotification(notif: Notification) {
    const users = await this.getEligibleUsers(notif);
    for (const user of users) {
      if (user.push) await this.push.send(user.userId, notif);
      if (user.email) await this.email.send(user.userId, notif);
      await this.analytics.trackDelivery(user.userId, notif.id);
    }
  }

  async getEligibleUsers(notif: Notification) {
    return [];
  }
}