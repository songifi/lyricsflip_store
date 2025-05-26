import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulerService {
  async scheduleNotification(notif: any) {
    console.log('Scheduled', notif);
  }
}