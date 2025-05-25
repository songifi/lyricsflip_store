import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Supporter,
  SupporterTier,
} from '../../../database/entities/supporter.entity';

@Injectable()
export class SupportersService {
  constructor(
    @InjectRepository(Supporter)
    private supporterRepository: Repository<Supporter>,
  ) {}

  async updateSupporterStats(
    supporterId: string,
    artistId: string,
    amount: number,
  ): Promise<Supporter> {
    let supporter = await this.supporterRepository.findOne({
      where: { supporterId, artistId },
    });

    if (!supporter) {
      supporter = this.supporterRepository.create({
        supporterId,
        artistId,
        totalSupported: 0,
        donationCount: 0,
        campaignsSupported: 0,
        tier: SupporterTier.BRONZE,
        firstSupportDate: new Date(),
        badges: [],
        preferences: {
          receiveUpdates: true,
          showInLeaderboard: true,
          allowDirectMessages: false,
        },
      });
    }

    supporter.totalSupported += amount;
    supporter.donationCount += 1;
    supporter.lastSupportDate = new Date();
    supporter.tier = this.calculateTier(supporter.totalSupported);
    supporter.badges = this.calculateBadges(supporter);

    return this.supporterRepository.save(supporter);
  }

  async getTopSupporters(
    artistId: string,
    limit: number = 10,
  ): Promise<Supporter[]> {
    return this.supporterRepository.find({
      where: {
        artistId,
        isActive: true,
        preferences: { showInLeaderboard: true } as any,
      },
      relations: ['supporter'],
      order: { totalSupported: 'DESC' },
      take: limit,
    });
  }

  async getSupporterProfile(
    supporterId: string,
    artistId: string,
  ): Promise<Supporter | null> {
    return this.supporterRepository.findOne({
      where: { supporterId, artistId },
      relations: ['supporter', 'artist'],
    });
  }

  private calculateTier(totalSupported: number): SupporterTier {
    if (totalSupported >= 1000) return SupporterTier.DIAMOND;
    if (totalSupported >= 500) return SupporterTier.PLATINUM;
    if (totalSupported >= 200) return SupporterTier.GOLD;
    if (totalSupported >= 50) return SupporterTier.SILVER;
    return SupporterTier.BRONZE;
  }

  private calculateBadges(supporter: Supporter): string[] {
    const badges: string[] = [];

    // Tier badges
    badges.push(`${supporter.tier}_supporter`);

    // Milestone badges
    if (supporter.totalSupported >= 100) badges.push('century_club');
    if (supporter.totalSupported >= 500) badges.push('major_supporter');
    if (supporter.totalSupported >= 1000) badges.push('super_fan');

    // Frequency badges
    if (supporter.donationCount >= 10) badges.push('frequent_supporter');
    if (supporter.donationCount >= 25) badges.push('dedicated_fan');

    // Time-based badges
    const daysSinceFirst = supporter.firstSupportDate
      ? Math.floor(
          (Date.now() - supporter.firstSupportDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    if (daysSinceFirst >= 365) badges.push('loyal_fan');
    if (daysSinceFirst >= 30 && supporter.donationCount >= 5) {
      badges.push('early_supporter');
    }

    return badges;
  }
}