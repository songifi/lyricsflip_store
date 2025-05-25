import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SampleLicense, LicenseType, LicenseStatus } from '../entities/sample-license.entity';
import { Sample } from '../entities/sample.entity';
import { CreateLicenseDto, PurchaseLicenseDto } from '../dto/create-license.dto';

@Injectable()
export class SampleLicensesService {
  constructor(
    @InjectRepository(SampleLicense)
    private readonly licenseRepository: Repository<SampleLicense>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
  ) {}

  async createLicense(
    sampleId: string,
    createLicenseDto: CreateLicenseDto,
    licenseeId: string,
  ): Promise<SampleLicense> {
    const sample = await this.sampleRepository.findOne({
      where: { id: sampleId },
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    if (!sample.isAvailableForLicensing) {
      throw new BadRequestException('Sample is not available for licensing');
    }

    // Check for exclusive licensing
    if (createLicenseDto.type === LicenseType.EXCLUSIVE) {
      if (!sample.allowsExclusiveLicensing) {
        throw new BadRequestException('Exclusive licensing not allowed for this sample');
      }

      if (sample.isExclusivelyLicensed) {
        throw new BadRequestException('Sample is already exclusively licensed');
      }
    }

    const license = this.licenseRepository.create({
      ...createLicenseDto,
      sampleId,
      licenseeId,
      status: LicenseStatus.PENDING,
    });

    const savedLicense = await this.licenseRepository.save(license);

    // If exclusive license, update sample
    if (createLicenseDto.type === LicenseType.EXCLUSIVE) {
      sample.isExclusivelyLicensed = true;
      sample.exclusiveLicenseeId = licenseeId;
      await this.sampleRepository.save(sample);
    }

    return this.findOne(savedLicense.id);
  }

  async findOne(id: string): Promise<SampleLicense> {
    const license = await this.licenseRepository.findOne({
      where: { id },
      relations: ['sample', 'licensee'],
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    return license;
  }

  async findUserLicenses(userId: string): Promise<SampleLicense[]> {
    return this.licenseRepository.find({
      where: { licenseeId: userId },
      relations: ['sample', 'sample.creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSampleLicenses(sampleId: string): Promise<SampleLicense[]> {
    return this.licenseRepository.find({
      where: { sampleId },
      relations: ['licensee'],
      order: { createdAt: 'DESC' },
    });
  }

  async activateLicense(id: string): Promise<SampleLicense> {
    const license = await this.findOne(id);

    if (license.status !== LicenseStatus.PENDING) {
      throw new BadRequestException('License is not in pending status');
    }

    license.status = LicenseStatus.ACTIVE;
    license.activatedAt = new Date();

    if (license.terms.duration) {
      license.expiresAt = new Date(
        Date.now() + license.terms.duration * 24 * 60 * 60 * 1000,
      );
    }

    return this.licenseRepository.save(license);
  }

  async revokeLicense(id: string, reason?: string): Promise<SampleLicense> {
    const license = await this.findOne(id);

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new BadRequestException('Only active licenses can be revoked');
    }

    license.status = LicenseStatus.REVOKED;

    // If exclusive license, update sample
    if (license.type === LicenseType.EXCLUSIVE) {
      const sample = await this.sampleRepository.findOne({
        where: { id: license.sampleId },
      });

      if (sample) {
        sample.isExclusivelyLicensed = false;
        sample.exclusiveLicenseeId = null;
        await this.sampleRepository.save(sample);
      }
    }

    return this.licenseRepository.save(license);
  }

  async checkLicenseExpiry(): Promise<void> {
    const expiredLicenses = await this.licenseRepository
      .createQueryBuilder('license')
      .where('license.status = :status', { status: LicenseStatus.ACTIVE })
      .andWhere('license.expiresAt <= :now', { now: new Date() })
      .getMany();

    for (const license of expiredLicenses) {
      license.status = LicenseStatus.EXPIRED;

      // If exclusive license, update sample
      if (license.type === LicenseType.EXCLUSIVE) {
        const sample = await this.sampleRepository.findOne({
          where: { id: license.sampleId },
        });

        if (sample) {
          sample.isExclusivelyLicensed = false;
          sample.exclusiveLicenseeId = null;
          await this.sampleRepository.save(sample);
        }
      }
    }

    if (expiredLicenses.length > 0) {
      await this.licenseRepository.save(expiredLicenses);
    }
  }

  async getLicenseTermsForType(type: LicenseType): Promise<any> {
    const defaultTerms = {
      [LicenseType.BASIC]: {
        commercialUse: false,
        distributionLimit: 1000,
        creditRequired: true,
        resaleAllowed: false,
        exclusiveRights: false,
        usageTypes: ['streaming', 'personal'],
      },
      [LicenseType.PREMIUM]: {
        commercialUse: true,
        distributionLimit: 10000,
        creditRequired: true,
        resaleAllowed: false,
        exclusiveRights: false,
        usageTypes: ['streaming', 'radio', 'commercial'],
      },
      [LicenseType.EXCLUSIVE]: {
        commercialUse: true,
        creditRequired: false,
        resaleAllowed: true,
        exclusiveRights: true,
        usageTypes: ['streaming', 'radio', 'commercial', 'sync', 'broadcast'],
      },
      [LicenseType.ROYALTY_FREE]: {
        commercialUse: true,
        creditRequired: false,
        resaleAllowed: false,
        exclusiveRights: false,
        royaltyRate: 0,
        usageTypes: ['streaming', 'commercial', 'sync'],
      },
    };

    return defaultTerms[type] || defaultTerms[LicenseType.BASIC];
  }

  async validateLicenseUsage(
    licenseId: string,
    usageType: string,
    distributionCount?: number,
  ): Promise<boolean> {
    const license = await this.findOne(licenseId);

    if (!license.isActive) {
      return false;
    }

    // Check usage type
    if (!license.terms.usageTypes.includes(usageType)) {
      return false;
    }

    // Check distribution limit
    if (
      license.terms.distributionLimit &&
      distributionCount &&
      distributionCount > license.terms.distributionLimit
    ) {
      return false;
    }

    return true;
  }
}