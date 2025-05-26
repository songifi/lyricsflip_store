import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BehaviorLog } from '../entities/behavior-log.entity';
import { Repository } from 'typeorm';
import { LogBehaviorDto } from '../dto/log-behavior.dto';

@Injectable()
export class BehaviorService {
  constructor(
    @InjectRepository(BehaviorLog)
    private readonly repo: Repository<BehaviorLog>,
  ) {}

  async logBehavior(userId: string, dto: LogBehaviorDto): Promise<BehaviorLog> {
    return this.repo.save({ userId, ...dto });
  }

  async analyzePatterns(userId: string) {
    const logs = await this.repo.find({ where: { userId } });
    const genreMap = {};
    logs.forEach(log => {
      genreMap[log.genre] = (genreMap[log.genre] || 0) + 1;
    });
    return {
      total: logs.length,
      genreDistribution: genreMap,
    };
  }
}
