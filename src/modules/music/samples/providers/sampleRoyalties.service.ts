import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SampleRoyalty, RoyaltyStatus, RoyaltyType } from '../entities/sample-royalty.entity';
import { Sample } from '../entities/sample.entity';
import { SampleUsage, UsageType } from '../entities/sample-usage.entity';
import { SampleLicense } from '../entities/sample-license.entity';

@Injectable()
export class SampleRoyaltiesService {
  constructor(
    @InjectRepository(SampleRoyalty)
    private readonly royaltyRepository: Repository<SampleRoyalty>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
    @InjectRepository(SampleUsage)
    private readonly usageRepository: Repository<SampleUsage>,
    @InjectRepository(SampleLicense)
    private readonly licenseRepository: Repository<SampleLicense>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyRoyalties(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.calculateRoyaltiesForPeriod(yesterday, today);
  }

  async calculateRoyaltiesForPeriod(startDate: Date, endDate: Date): Promise<void> {
    // Get all samples with usage in the period
    const samplesWithUsage = await this.usageRepository
      .createQueryBuilder('usage')
      .select('usage.sampleId')
      .addSelect('COUNT(*)', 'usageCount')
      .where('usage.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('usage.type IN (:...types)', { 
        types: [UsageType.STREAM, UsageType.DOWNLOAD, UsageType.PURCHASE] 
      })
      .groupBy('usage.sampleId')
      .getRawMany();

    for (const sampleUsage of samplesWithUsage) {
      await this.calculateSampleRoyalty(
        sampleUsage.sampleId,
        parseInt(sampleUsage.usageCount),
        startDate,
        endDate,
      );
    }
  }

  async calculateSampleRoyalty(
    sampleId: string,
    usageCount: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    const sample = await this.sampleRepository.findOne({
      where: { id: sampleId },
      relations: ['creator', 'licenses'],
    });

    if (!sample) {
      return;
    }

    // Calculate revenue based on licenses and usage
    const grossRevenue = await this.calculateGrossRevenue(sampleId, periodStart, periodEnd);
    
    // Get applicable royalty rate
    const royaltyRate = await this.getRoyaltyRate(sampleId);
    
    const royaltyAmount = grossRevenue * (royaltyRate / 100);

    // Check if royalty already exists for this period
    const existingRoyalty = await this.royaltyRepository.findOne({
      where: {
        sampleId,
        creatorId: sample.creatorId,
        periodStart,
        periodEnd,
      },
    });

    if (existingRoyalty) {
      // Update existing royalty
      existingRoyalty.amount = royaltyAmount;
      existingRoyalty.grossRevenue = grossRevenue;
      existingRoyalty.usageCount = usageCount;
      existingRoyalty.rate = royaltyRate;
      existingRoyalty.status = RoyaltyStatus.CALCULATED;
      existingRoyalty.calculatedAt = new Date();

      await this.royaltyRepository.save(existingRoyalty);
    } else {
      // Create new royalty
      const royalty = this.royaltyRepository.create({
        sampleId,
        creatorId: sample.creatorId,
        type: RoyaltyType.STREAMING,
        amount: royaltyAmount,
        rate: royaltyRate,
        grossRevenue,
        usageCount,
        periodStart,
        periodEnd,
        status: RoyaltyStatus.CALCULATED,
        calculatedAt: new Date(),
      });

      await this.royaltyRepository.save(royalty);
    }
  }

  async getCreatorRoyalties(
    creatorId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    royalties: SampleRoyalty[];
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
  }> {
    const queryBuilder = this.royaltyRepository
      .createQueryBuilder('royalty')
      .leftJoinAndSelect('royalty.sample', 'sample')
      .where('royalty.creatorId = :creatorId', { creatorId });

    if (startDate && endDate) {
      queryBuilder.andWhere('royalty.periodStart >= :startDate', { startDate });
      queryBuilder.andWhere('royalty.periodEnd <= :endDate', { endDate });
    }

    const royalties = await queryBuilder
      .orderBy('royalty.periodStart', 'DESC')
      .getMany();

    const totalAmount = royalties.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalPaid = royalties
      .filter(r => r.status === RoyaltyStatus.PAID)
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const totalPending = royalties
      .filter(r => r.status === RoyaltyStatus.CALCULATED)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      royalties,
      totalAmount,
      totalPaid,
      totalPending,
    };
  }

  async getSampleRoyalties(sampleId: string): Promise<SampleRoyalty[]> {
    return this.royaltyRepository.find({
      where: { sampleId },
      relations: ['creator', 'license'],
      order: { periodStart: 'DESC' },
    });
  }

  async markRoyaltiesAsPaid(royaltyIds: string[]): Promise<void> {
    await this.royaltyRepository.update(
      { id: In(royaltyIds) },
      {
        status: RoyaltyStatus.PAID,
        paidAt: new Date(),
      },
    );
  }

  async getRoyaltyAnalytics(creatorId: string): Promise<{
    monthlyEarnings: Array<{ month: string; amount: number }>;
    topEarningSamples: Array<{ sample: Sample; totalEarnings: number }>;
    royaltyBreakdown: Array<{ type: RoyaltyType; amount: number }>;
  }> {
    // Monthly earnings for the last 12 months
    const monthlyEarnings = await this.royaltyRepository
      .createQueryBuilder('royalty')
      .select('DATE_TRUNC(\'month\', royalty.periodStart)', 'month')
      .addSelect('SUM(royalty.amount)', 'amount')
      .where('royalty.creatorId = :creatorId', { creatorId })
      .andWhere('royalty.periodStart >= :startDate', {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
      .groupBy('DATE_TRUNC(\'month\', royalty.periodStart)')
      .orderBy('month', 'DESC')
      .getRawMany();

    // Top earning samples
    const topEarningSamples = await this.royaltyRepository
      .createQueryBuilder('royalty')
      .leftJoinAndSelect('royalty.sample', 'sample')
      .select('sample')
      .addSelect('SUM(royalty.amount)', 'totalEarnings')
      .where('royalty.creatorId = :creatorId', { creatorId })
      .groupBy('sample.id')
      .orderBy('totalEarnings', 'DESC')
      .limit(10)
      .getRawAndEntities();

    // Royalty breakdown by type
    const royaltyBreakdown = await this.royaltyRepository
      .createQueryBuilder('royalty')
      .select('royalty.type', 'type')
      .addSelect('SUM(royalty.amount)', 'amount')
      .where('royalty.creatorId = :creatorId', { creatorId })
      .groupBy('royalty.type')
      .getRawMany();

    return {
      monthlyEarnings: monthlyEarnings.map(m => ({
        month: m.month,
        amount: Number(m.amount),
      })),
      topEarningSamples: topEarningSamples.entities.map((sample, index) => ({
        sample,
        totalEarnings: Number(topEarningSamples.raw[index].totalEarnings),
      })),
      royaltyBreakdown: royaltyBreakdown.map(r => ({
        type: r.type,
        amount: Number(r.amount),
      })),
    };
  }

  private async calculateGrossRevenue(
    sampleId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    // This would integrate with your purchases module
    // For now, return a placeholder calculation
    const usageCount = await this.usageRepository.count({
      where: {
        sampleId,
        type: In([UsageType.STREAM, UsageType.DOWNLOAD]),
        createdAt: Between(periodStart, periodEnd),
      },
    });

    // Simplified calculation - in reality, this would be based on actual purchases
    return usageCount * 0.01; // $0.01 per stream/download
  }

  private async getRoyaltyRate(sampleId: string): Promise<number> {
    // Get the highest royalty rate from active licenses
    const licenses = await this.licenseRepository.find({
      where: { sampleId, status: 'active' },
    });

    if (licenses.length === 0) {
      return 70; // Default 70% to creator
    }

    const maxRate = Math.max(...licenses.map(l => l.royaltyRate));
    return maxRate || 70;
  }
}