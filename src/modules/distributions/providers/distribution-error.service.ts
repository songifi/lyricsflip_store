import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionError, ErrorSeverity } from '../entities/distribution-error.entity';

@Injectable()
export class DistributionErrorService {
  private readonly logger = new Logger(DistributionErrorService.name);

  constructor(
    private readonly errorRepository: Repository<DistributionError>,
  ) {}

  async logError(
    releaseId: string,
    platform: string,
    errorCode: string,
    errorMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    errorDetails?: Record<string, any>,
  ): Promise<DistributionError> {
    const error = this.errorRepository.create({
      releaseId,
      platform,
      errorCode,
      errorMessage,
      severity,
      errorDetails,
    });

    const savedError = await this.errorRepository.save(error);
    
    this.logger.error(
      `Distribution error [${severity}] for release ${releaseId} on ${platform}: ${errorMessage}`,
      errorDetails,
    );

    return savedError;
  }

  async getErrors(
    releaseId?: string,
    platform?: string,
    resolved?: boolean,
  ): Promise<DistributionError[]> {
    const whereCondition: any = {};

    if (releaseId) whereCondition.releaseId = releaseId;
    if (platform) whereCondition.platform = platform;
    if (resolved !== undefined) whereCondition.resolved = resolved;

    return this.errorRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  async resolveError(id: string, resolution: string, resolvedBy?: string): Promise<DistributionError> {
    const error = await this.errorRepository.findOne({ where: { id } });
    
    if (!error) {
      throw new Error(`Error with ID ${id} not found`);
    }

    error.resolved = true;
    error.resolvedAt = new Date();
    error.resolution = resolution;
    error.resolvedBy = resolvedBy;

    return this.errorRepository.save(error);
  }

  async getCriticalErrors(): Promise<DistributionError[]> {
    return this.errorRepository.find({
      where: {
        severity: ErrorSeverity.CRITICAL,
        resolved: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getErrorStats(): Promise<Record<string, any>> {
    const totalErrors = await this.errorRepository.count();
    const unresolvedErrors = await this.errorRepository.count({ where: { resolved: false } });
    const criticalErrors = await this.errorRepository.count({
      where: { severity: ErrorSeverity.CRITICAL, resolved: false },
    });

    const errorsByPlatform = await this.errorRepository
      .createQueryBuilder('error')
      .select('error.platform')
      .addSelect('COUNT(*)', 'count')
      .where('error.resolved = false')
      .groupBy('error.platform')
      .getRawMany();

    return {
      totalErrors,
      unresolvedErrors,
      criticalErrors,
      errorsByPlatform: errorsByPlatform.reduce((acc, item) => {
        acc[item.platform] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}
