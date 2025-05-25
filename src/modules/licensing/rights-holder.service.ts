import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RightsHolder } from '../entities/rights-holder.entity';
import { CreateRightsHolderDto } from '../dto/create-rights-holder.dto';
import { UpdateRightsHolderDto } from '../dto/update-rights-holder.dto';

@Injectable()
export class RightsHolderService {
  constructor(
    @InjectRepository(RightsHolder)
    private readonly holderRepo: Repository<RightsHolder>,
  ) {}

  async create(dto: CreateRightsHolderDto): Promise<RightsHolder> {
    const holder = this.holderRepo.create(dto);
    return this.holderRepo.save(holder);
  }

  async findAll(): Promise<RightsHolder[]> {
    return this.holderRepo.find({ relations: ['licenses', 'royaltyDistributions'] });
  }

  async findOne(id: string): Promise<RightsHolder> {
    const holder = await this.holderRepo.findOne({
      where: { id },
      relations: ['licenses', 'royaltyDistributions'],
    });
    if (!holder) {
      throw new NotFoundException(`Rights holder ${id} not found`);
    }
    return holder;
  }

  async update(id: string, dto: UpdateRightsHolderDto): Promise<RightsHolder> {
    const holder = await this.findOne(id);
    const updated = this.holderRepo.merge(holder, dto);
    return this.holderRepo.save(updated);
  }

  async remove(id: string): Promise<void> {
    const holder = await this.findOne(id);
    await this.holderRepo.remove(holder);
  }

  async isVerified(id: string): Promise<boolean> {
    const holder = await this.findOne(id);
    return holder.isVerified;
  }

  async canReceiveRoyalties(id: string): Promise<boolean> {
    const holder = await this.findOne(id);
    return holder.canReceiveRoyalties();
  }

  async activeLicensesCount(id: string): Promise<number> {
    const holder = await this.findOne(id);
    return holder.getActiveLicensesCount();
  }

  async hasValidBanking(id: string): Promise<boolean> {
    const holder = await this.findOne(id);
    return holder.hasValidBankingInfo();
  }

  async verifyHolder(id: string, verifiedBy: string): Promise<RightsHolder> {
    const holder = await this.findOne(id);
    holder.isVerified = true;
    holder.verifiedAt = new Date();
    holder.verifiedBy = verifiedBy;
    return this.holderRepo.save(holder);
  }
}
