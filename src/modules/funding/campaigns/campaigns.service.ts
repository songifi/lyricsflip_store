import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  FundingCampaign,
  CampaignStatus,
} from '../../../database/entities/funding-campaign.entity';
import { Donation } from '../../../database/entities/donation.entity';
import { User } from '../../../database/entities/user.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(FundingCampaign)
    private campaignRepository: Repository<FundingCampaign>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    artistId: string,
  ): Promise<FundingCampaign> {
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      artistId,
      milestones: createCampaignDto.milestones?.map((milestone) => ({
        ...milestone,
        achieved: false,
      })),
      rewards: createCampaignDto.rewards?.map((reward) => ({
        ...reward,
        claimedQuantity: 0,
      })),
    });

    return this.campaignRepository.save(campaign);
  }

  async findAll(filters?: {
    artistId?: string;
    status?: CampaignStatus;
    type?: string;
    isPublic?: boolean;
  }): Promise<FundingCampaign[]> {
    const where: FindOptionsWhere<FundingCampaign> = {};

    if (filters?.artistId) where.artistId = filters.artistId;
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type as any;
    if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic;

    return this.campaignRepository.find({
      where,
      relations: ['artist', 'album'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FundingCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['artist', 'album', 'donations'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    userId: string,
  ): Promise<FundingCampaign> {
    const campaign = await this.findOne(id);

    if (campaign.artistId !== userId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    if (campaign.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed campaigns');
    }

    Object.assign(campaign, updateCampaignDto);
    return this.campaignRepository.save(campaign);
  }

  async updateProgress(campaignId: string): Promise<FundingCampaign> {
    const campaign = await this.findOne(campaignId);

    const totalDonations = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.campaignId = :campaignId', { campaignId })
      .andWhere('donation.status = :status', { status: 'completed' })
      .getRawOne();

    const currentAmount = parseFloat(totalDonations.total) || 0;
    const progressPercentage = Math.min(
      (currentAmount / campaign.goalAmount) * 100,
      100,
    );

    // Check and update milestones
    if (campaign.milestones) {
      campaign.milestones = campaign.milestones.map((milestone) => {
        if (!milestone.achieved && currentAmount >= milestone.amount) {
          return {
            ...milestone,
            achieved: true,
            achievedAt: new Date(),
          };
        }
        return milestone;
      });
    }

    // Update campaign status if goal is reached
    if (progressPercentage >= 100 && campaign.status === CampaignStatus.ACTIVE) {
      campaign.status = CampaignStatus.COMPLETED;
    }

    campaign.currentAmount = currentAmount;
    campaign.progressPercentage = progressPercentage;

    return this.campaignRepository.save(campaign);
  }

  async getTopCampaigns(limit: number = 10): Promise<FundingCampaign[]> {
    return this.campaignRepository.find({
      where: { isPublic: true, status: CampaignStatus.ACTIVE },
      order: { progressPercentage: 'DESC', currentAmount: 'DESC' },
      take: limit,
      relations: ['artist'],
    });
  }

  async getCampaignAnalytics(campaignId: string, userId: string) {
    const campaign = await this.findOne(campaignId);

    if (campaign.artistId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const donations = await this.donationRepository.find({
      where: { campaignId },
      relations: ['supporter'],
      order: { createdAt: 'DESC' },
    });

    const analytics = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + Number(d.amount), 0),
      averageDonation: donations.length > 0 
        ? donations.reduce((sum, d) => sum + Number(d.amount), 0) / donations.length 
        : 0,
      uniqueSupporters: new Set(donations.map(d => d.supporterId)).size,
      donationsByDay: this.groupDonationsByDay(donations),
      topDonations: donations
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10),
      recentDonations: donations.slice(0, 20),
    };

    return analytics;
  }

  private groupDonationsByDay(donations: Donation[]) {
    const grouped = donations.reduce((acc, donation) => {
      const date = donation.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, amount: 0 };
      }
      acc[date].count++;
      acc[date].amount += Number(donation.amount);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async delete(id: string, userId: string): Promise<void> {
    const campaign = await this.findOne(id);

    if (campaign.artistId !== userId) {
      throw new ForbiddenException('You can only delete your own campaigns');
    }

    if (campaign.currentAmount > 0) {
      throw new BadRequestException(
        'Cannot delete campaigns that have received donations',
      );
    }

    await this.campaignRepository.remove(campaign);
  }
}