import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Donation,
  DonationStatus,
  DonationType,
} from '../../../database/entities/donation.entity';
import { FundingCampaign } from '../../../database/entities/funding-campaign.entity';
import { User } from '../../../database/entities/user.entity';
import { SupportersService } from '../supporters/supporters.service';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(FundingCampaign)
    private campaignRepository: Repository<FundingCampaign>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private supportersService: SupportersService,
  ) {}

  async create(
    createDonationDto: CreateDonationDto,
    supporterId: string,
  ): Promise<Donation> {
    // Validate artist exists
    const artist = await this.userRepository.findOne({
      where: { id: createDonationDto.artistId },
    });
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    // Validate campaign if provided
    let campaign: FundingCampaign | undefined;
    if (createDonationDto.campaignId) {
      campaign = await this.campaignRepository.findOne({
        where: { id: createDonationDto.campaignId },
      });
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }
      if (campaign.status !== 'active') {
        throw new BadRequestException('Campaign is not active');
      }
    }

    // Validate reward if provided
    let rewardDetails;
    if (createDonationDto.rewardId && campaign) {
      const reward = campaign.rewards?.find(
        (r) => r.title === createDonationDto.rewardId,
      );
      if (!reward) {
        throw new NotFoundException('Reward not found');
      }
      if (
        reward.limitedQuantity &&
        reward.claimedQuantity >= reward.limitedQuantity
      ) {
        throw new BadRequestException('Reward is no longer available');
      }
      if (createDonationDto.amount < reward.amount) {
        throw new BadRequestException(
          'Donation amount is less than reward minimum',
        );
      }
      rewardDetails = {
        rewardId: createDonationDto.rewardId,
        title: reward.title,
        description: reward.description,
        estimatedDelivery: reward.estimatedDelivery,
      };
    }

    // Process payment (mock implementation)
    const paymentResult = await this.processPayment(createDonationDto);

    const donation = this.donationRepository.create({
      ...createDonationDto,
      supporterId,
      status: paymentResult.success
        ? DonationStatus.COMPLETED
        : DonationStatus.FAILED,
      paymentDetails: paymentResult,
      rewardDetails,
    });

    const savedDonation = await this.donationRepository.save(donation);

    if (paymentResult.success) {
      // Update supporter record
      await this.supportersService.updateSupporterStats(
        supporterId,
        createDonationDto.artistId,
        Number(createDonationDto.amount),
      );

      // Update campaign progress if applicable
      if (campaign) {
        await this.updateCampaignProgress(campaign.id);
      }

      // Update reward claimed quantity
      if (rewardDetails && campaign) {
        await this.updateRewardClaimed(campaign.id, createDonationDto.rewardId);
      }
    }

    return savedDonation;
  }

  async findAll(filters?: {
    supporterId?: string;
    artistId?: string;
    campaignId?: string;
    type?: DonationType;
    status?: DonationStatus;
  }): Promise<Donation[]> {
    const queryBuilder = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.supporter', 'supporter')
      .leftJoinAndSelect('donation.artist', 'artist')
      .leftJoinAndSelect('donation.campaign', 'campaign');

    if (filters?.supporterId) {
      queryBuilder.andWhere('donation.supporterId = :supporterId', {
        supporterId: filters.supporterId,
      });
    }

    if (filters?.artistId) {
      queryBuilder.andWhere('donation.artistId = :artistId', {
        artistId: filters.artistId,
      });
    }

    if (filters?.campaignId) {
      queryBuilder.andWhere('donation.campaignId = :campaignId', {
        campaignId: filters.campaignId,
      });
    }

    if (filters?.type) {
      queryBuilder.andWhere('donation.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('donation.status = :status', {
        status: filters.status,
      });
    }

    return queryBuilder
      .orderBy('donation.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Donation> {
    const donation = await this.donationRepository.findOne({
      where: { id },
      relations: ['supporter', 'artist', 'campaign'],
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return donation;
  }

  async getTopDonations(
    artistId?: string,
    limit: number = 10,
  ): Promise<Donation[]> {
    const queryBuilder = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.supporter', 'supporter')
      .leftJoinAndSelect('donation.artist', 'artist')
      .where('donation.status = :status', { status: DonationStatus.COMPLETED })
      .andWhere('donation.isPublic = :isPublic', { isPublic: true });

    if (artistId) {
      queryBuilder.andWhere('donation.artistId = :artistId', { artistId });
    }

    return queryBuilder
      .orderBy('donation.amount', 'DESC')
      .take(limit)
      .getMany();
  }

  async getRecentDonations(
    artistId?: string,
    limit: number = 20,
  ): Promise<Donation[]> {
    const queryBuilder = this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.supporter', 'supporter')
      .leftJoinAndSelect('donation.artist', 'artist')
      .where('donation.status = :status', { status: DonationStatus.COMPLETED })
      .andWhere('donation.isPublic = :isPublic', { isPublic: true });

    if (artistId) {
      queryBuilder.andWhere('donation.artistId = :artistId', { artistId });
    }

    return queryBuilder
      .orderBy('donation.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  private async processPayment(donationDto: CreateDonationDto) {
    // Mock payment processing - replace with actual payment processor
    const processorFee = Number(donationDto.amount) * 0.029 + 0.3; // Stripe-like fees
    const netAmount = Number(donationDto.amount) - processorFee;

    // Simulate payment processing
    const success = Math.random() > 0.05; // 95% success rate

    return {
      success,
      paymentMethod: donationDto.paymentMethod,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processorFee: success ? processorFee : 0,
      netAmount: success ? netAmount : 0,
    };
  }

  private async updateCampaignProgress(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) return;

    const totalDonations = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.campaignId = :campaignId', { campaignId })
      .andWhere('donation.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();

    const currentAmount = parseFloat(totalDonations.total) || 0;
    const progressPercentage = Math.min(
      (currentAmount / campaign.goalAmount) * 100,
      100,
    );

    campaign.currentAmount = currentAmount;
    campaign.progressPercentage = progressPercentage;

    await this.campaignRepository.save(campaign);
  }

  private async updateRewardClaimed(
    campaignId: string,
    rewardId: string,
  ): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign || !campaign.rewards) return;

    campaign.rewards = campaign.rewards.map((reward) => {
      if (reward.title === rewardId) {
        return {
          ...reward,
          claimedQuantity: (reward.claimedQuantity || 0) + 1,
        };
      }
      return reward;
    });

    await this.campaignRepository.save(campaign);
  }
}