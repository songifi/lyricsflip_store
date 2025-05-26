import { Injectable } from '@nestjs/common';
import { Notification } from '../entity/notification.entity';

@Injectable()
export class EmailService {
  async send(userId: string, notif: Notification) {
    console.log(`Email sent to ${userId}: ${notif.message}`);
  }
}