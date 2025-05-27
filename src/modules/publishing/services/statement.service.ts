import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publishing } from '../entities/publishing.entity';
import { PublishingStatement } from '../entities/statement.entity';
import { calculateMechanicalRoyalty } from '../utils/royalty-calculator';

@Injectable()
export class StatementService {
  constructor(
    @InjectRepository(Publishing)
    private publishingRepo: Repository<Publishing>,
    @InjectRepository(PublishingStatement)
    private statementRepo: Repository<PublishingStatement>,
  ) {}

  async generateStatement(publishingId: number, revenue: number) {
    const publishing = await this.publishingRepo.findOne({
      where: { id: publishingId },
      relations: ['songwriters'],
    });

    const breakdown = publishing.songwriters.map(writer => ({
      name: writer.name,
      split: writer.splitPercentage,
      royalty: calculateMechanicalRoyalty(revenue, writer.splitPercentage),
    }));

    const totalAmount = breakdown.reduce((sum, r) => sum + r.royalty, 0);

    const statement = this.statementRepo.create({
      publishing,
      breakdown,
      totalAmount,
    });

    return this.statementRepo.save(statement);
  }
}
