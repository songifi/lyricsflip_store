import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasteProfile } from '../entities/taste-profile.entity';
import { Repository } from 'typeorm';
import { CreateTasteProfileDto } from '../dto/create-taste-profile.dto';

@Injectable()
export class TasteProfileService {
  constructor(
    @InjectRepository(TasteProfile)
    private readonly profileRepo: Repository<TasteProfile>,
  ) {}

  async createOrUpdate(userId: string, dto: CreateTasteProfileDto): Promise<TasteProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (profile) {
      profile = Object.assign(profile, dto);
    } else {
      profile = this.profileRepo.create({ ...dto, userId });
    }
    return this.profileRepo.save(profile);
  }

  async getByUserId(userId: string): Promise<TasteProfile> {
    return this.profileRepo.findOne({ where: { userId } });
  }
}
