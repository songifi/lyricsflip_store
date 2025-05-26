import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  async trackDelivery(userId: string, notificationId: string) {
    console.log(`Delivered to ${userId} notification ${notificationId}`);
  }

  async markOpened(userId: string, notificationId: string) {}

  async markClicked(userId: string, notificationId: string) {}
}