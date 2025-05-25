// src/licensing/services/license.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../entities/license.entity';
import { CreateLicenseDto, UpdateLicenseDto } from '../dtos/license.dto';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
  ) {}

  async create(data: CreateLicenseDto): Promise<License> {
    const license = this.licenseRepo.create(data);
    return this.licenseRepo.save(license);
  }

  async findAll(): Promise<License[]> {
    return this.licenseRepo.find({ relations: ['rightsHolder', 'agreements', 'royaltyDistributions'] });
  }

  async findOne(id: string): Promise<License> {
    const license = await this.licenseRepo.findOne({ where: { id }, relations: ['rightsHolder', 'agreements', 'royaltyDistributions'] });
    if (!license) throw new NotFoundException('License not found');
    return license;
  }

  async update(id: string, data: UpdateLicenseDto): Promise<License> {
    const license = await this.findOne(id);
    Object.assign(license, data);
    return this.licenseRepo.save(license);
  }

  async delete(id: string): Promise<void> {
    const license = await this.findOne(id);
    await this.licenseRepo.remove(license);
  }

  async calculateRoyalty(id: string, grossRevenue: number): Promise<number> {
    const license = await this.findOne(id);
    return license.calculateRoyalty(grossRevenue);
  }

  async getActiveLicenses(): Promise<License[]> {
    const licenses = await this.findAll();
    return licenses.filter(l => l.isActive());
  }

  async verifyTerritory(id: string, territory: string): Promise<boolean> {
    const license = await this.findOne(id);
    return license.isValidInTerritory(territory);
  }

  async isExpired(id: string): Promise<boolean> {
    const license = await this.findOne(id);
    return license.isExpired();
  }
}
