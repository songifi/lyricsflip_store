import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RightsSocietyReport } from '../entities/rights-society.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RightsReportService {
  constructor(
    @InjectRepository(RightsSocietyReport)
    private reportRepo: Repository<RightsSocietyReport>,
  ) {}

  async generateReport(societyName: string, data: any) {
    const report = this.reportRepo.create({ societyName, data });
    return this.reportRepo.save(report);
  }

  async getReports() {
    return this.reportRepo.find();
  }
}
