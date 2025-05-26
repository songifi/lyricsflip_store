import { Injectable } from '@nestjs/common';
import { Notification } from '../entity/notification.entity';

@Injectable()
export class PushService {
  async send(userId: string, notif: Notification) {
    console.log(`Push sent to ${userId}: ${notif.message}`);
  }
}