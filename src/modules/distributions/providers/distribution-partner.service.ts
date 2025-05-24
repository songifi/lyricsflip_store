import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionPartner, PlatformType } from '../entities/distribution-partner.entity';

@Injectable()
export class DistributionPartnerService {
  private readonly partnerRepository: Repository<DistributionPartner>;

  constructor(
    @InjectRepository(DistributionPartner)
    partnerRepository: Repository<DistributionPartner>,
  ) {
    this.partnerRepository = partnerRepository;
  }

  async findAll(): Promise<DistributionPartner[]> {
    return this.partnerRepository.find({
      where: { isActive: true },
    });
  }

  async findByPlatform(platform: PlatformType): Promise<DistributionPartner> {
    const partner = await this.partnerRepository.findOne({
      where: { platform, isActive: true },
    });

    if (!partner) {
      throw new NotFoundException(`Distribution partner for ${platform} not found`);
    }

    return partner;
  }

  async create(partnerData: Partial<DistributionPartner>): Promise<DistributionPartner> {
    const partner = this.partnerRepository.create(partnerData);
    return this.partnerRepository.save(partner);
  }

  async update(id: string, updateData: Partial<DistributionPartner>): Promise<DistributionPartner> {
    await this.partnerRepository.update(id, updateData);
    const updatedPartner = await this.partnerRepository.findOne({ where: { id } });
    
    if (!updatedPartner) {
      throw new NotFoundException(`Distribution partner with ID ${id} not found`);
    }

    return updatedPartner;
  }

  async getPartnerConfig(platform: PlatformType): Promise<Record<string, any>> {
    const partner = await this.findByPlatform(platform);
    return partner.platformConfig || {};
  }

  async validatePartnerCredentials(platform: PlatformType): Promise<boolean> {
    const partner = await this.findByPlatform(platform);
    
    // Implement platform-specific credential validation
    switch (platform) {
      case PlatformType.SPOTIFY:
        return this.validateSpotifyCredentials(partner.apiCredentials);
      case PlatformType.APPLE_MUSIC:
        return this.validateAppleMusicCredentials(partner.apiCredentials);
      default:
        return true;
    }
  }

  private async validateSpotifyCredentials(credentials: Record<string, any>): Promise<boolean> {
    // Implement Spotify API credential validation
    return credentials?.clientId && credentials?.clientSecret;
  }

  private async validateAppleMusicCredentials(credentials: Record<string, any>): Promise<boolean> {
    // Implement Apple Music API credential validation
    return credentials?.keyId && credentials?.teamId && credentials?.privateKey;
  }
}
