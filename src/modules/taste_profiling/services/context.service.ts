import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BehaviorLog } from '../entities/behavior-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContextService {
  constructor(
    @InjectRepository(BehaviorLog)
    private readonly repo: Repository<BehaviorLog>,
  ) {}

  async analyzeContext(userId: string) {
    const logs = await this.repo.find({ where: { userId } });

    const contextMap = {};
    logs.forEach(log => {
      const hour = log.listenedAt.getHours();
      const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      contextMap[partOfDay] = (contextMap[partOfDay] || 0) + 1;
    });

    return contextMap;
  }
}
