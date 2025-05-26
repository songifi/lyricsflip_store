import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionSocietyReport, ReportStatus } from '../entities/collection-society-report.entity';

@Injectable()
export class CollectionSocietyReportService {
  constructor(
    @InjectRepository(CollectionSocietyReport)
    private reportRepository: Repository<CollectionSocietyReport>,
  ) {}

  async create(createReportDto: any): Promise<CollectionSocietyReport> {
    const report = this.reportRepository.create({
      ...createReportDto,
      reportingPeriodStart: new Date(createReportDto.reportingPeriodStart),
      reportingPeriodEnd: new Date(createReportDto.reportingPeriodEnd),
    });

    return this.reportRepository.save(report);
  }

  async findAll(filters?: {
    submittedById?: string;
    reportType?: string;
    society?: string;
    status?: ReportStatus;
    reportingPeriod?: string;
  }): Promise<CollectionSocietyReport[]> {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.submittedBy', 'submittedBy');

    if (filters?.submittedById) {
      query.andWhere('report.submittedById = :submittedById', { submittedById: filters.submittedById });
    }

    if (filters?.reportType) {
      query.andWhere('report.reportType = :reportType', { reportType: filters.reportType });
    }

    if (filters?.society) {
      query.andWhere('report.society = :society', { society: filters.society });
    }

    if (filters?.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters?.reportingPeriod) {
      query.andWhere('report.reportingPeriod = :reportingPeriod', { reportingPeriod: filters.reportingPeriod });
    }

    return query.orderBy('report.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<CollectionSocietyReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['submittedBy'],
    });

    if (!report) {
      throw new NotFoundException(`Collection society report with ID ${id} not found`);
    }

    return report;
  }

  async submit(id: string, submissionReference?: string): Promise<CollectionSocietyReport> {
    const report = await this.findOne(id);

    report.status = ReportStatus.SUBMITTED;
    report.submissionDate = new Date();
    report.submissionReference = submissionReference;

    return this.reportRepository.save(report);
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    rejectionReason?: string,
  ): Promise<CollectionSocietyReport> {
    const report = await this.findOne(id);

    report.status = status;
    if (status === ReportStatus.REJECTED && rejectionReason) {
      report.rejectionReason = rejectionReason;
    }

    return this.reportRepository.save(report);
  }

  async generateReport(
    reportType: string,
    society: string,
    reportingPeriodStart: Date,
    reportingPeriodEnd: Date,
    submittedById: string,
  ): Promise<CollectionSocietyReport> {
    // This would typically involve complex business logic to gather
    // performance, mechanical, or other rights data for the reporting period
    const reportData = await this.gatherReportData(
      reportType,
      reportingPeriodStart,
      reportingPeriodEnd,
    );

    const reportingPeriod = this.generateReportingPeriodString(
      reportingPeriodStart,
      reportingPeriodEnd,
    );

    return this.create({
      reportType,
      society,
      submittedById,
      reportingPeriodStart,
      reportingPeriodEnd,
      reportingPeriod,
      reportData,
    });
  }

  private async gatherReportData(
    reportType: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // This is a simplified implementation
    // In a real system, this would query various tables to gather
    // performance data, mechanical royalties, etc.
    return {
      works: [],
      totalRevenue: 0,
      currency: 'USD',
    };
  }

  private generateReportingPeriodString(startDate: Date, endDate: Date): string {
    const year = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;

    if (startMonth === 1 && endMonth === 3) return `${year}-Q1`;
    if (startMonth === 4 && endMonth === 6) return `${year}-Q2`;
    if (startMonth === 7 && endMonth === 9) return `${year}-Q3`;
    if (startMonth === 10 && endMonth === 12) return `${year}-Q4`;

    return `${year}-${String(startMonth).padStart(2, '0')}`;
  }
}