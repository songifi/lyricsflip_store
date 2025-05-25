import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicensingAgreement } from '../entities/licensing-agreement.entity';
import { CreateLicensingAgreementDto } from '../dto/create-licensing-agreement.dto';
import { UpdateLicensingAgreementDto } from '../dto/update-licensing-agreement.dto';

@Injectable()
export class LicensingAgreementService {
  constructor(
    @InjectRepository(LicensingAgreement)
    private readonly agreementRepo: Repository<LicensingAgreement>,
  ) {}

  async create(dto: CreateLicensingAgreementDto): Promise<LicensingAgreement> {
    const agreement = this.agreementRepo.create(dto);
    return this.agreementRepo.save(agreement);
  }

  async findAll(): Promise<LicensingAgreement[]> {
    return this.agreementRepo.find({ relations: ['license'] });
  }

  async findOne(id: string): Promise<LicensingAgreement> {
    const agreement = await this.agreementRepo.findOne({
      where: { id },
      relations: ['license'],
    });
    if (!agreement) {
      throw new NotFoundException(`Agreement ${id} not found`);
    }
    return agreement;
  }

  async update(id: string, dto: UpdateLicensingAgreementDto): Promise<LicensingAgreement> {
    const agreement = await this.findOne(id);
    const updated = this.agreementRepo.merge(agreement, dto);
    return this.agreementRepo.save(updated);
  }

  async remove(id: string): Promise<void> {
    const agreement = await this.findOne(id);
    await this.agreementRepo.remove(agreement);
  }

  async calculateRoyalty(id: string, grossRevenue: number): Promise<number> {
    const agreement = await this.findOne(id);
    return agreement.calculateRoyalty(grossRevenue);
  }

  async checkRenewalNeeded(id: string, daysInAdvance = 90): Promise<boolean> {
    const agreement = await this.findOne(id);
    return agreement.needsRenewal(daysInAdvance);
  }

  async isFullySigned(id: string): Promise<boolean> {
    const agreement = await this.findOne(id);
    return agreement.isFullySigned();
  }

  async canBeTerminated(id: string): Promise<boolean> {
    const agreement = await this.findOne(id);
    return agreement.canTerminate();
  }
}
