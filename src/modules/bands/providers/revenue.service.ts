import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueShare, RevenueType, ShareStatus } from '../../database/entities/revenue-share.entity';
import { BandsService } from './bands.service';
import { MemberPermission } from '../../database/entities/band-member.entity';

export interface CreateRevenueShareDto {
  memberId: string;
  revenueType: RevenueType;
  percentage: number;
  effectiveDate: string;
  endDate?: string;
  notes?: string;
  conditions?: {
    minimumAmount?: number;
    maximumAmount?: number;
    specificAlbums?: string[];
    specificTracks?: string[];
  };
}

export interface UpdateRevenueShareDto {
  percentage?: number;
  status?: ShareStatus;
  endDate?: string;
  notes?: string;
  conditions?: {
    minimumAmount?: number;
    maximumAmount?: number;
    specificAlbums?: string[];
    specificTracks?: string[];
  };
}

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(RevenueShare)
    private revenueShareRepository: Repository<RevenueShare>,
    private bandsService: BandsService,
  ) {}

  async createRevenueShare(
    bandId: string,
    createRevenueShareDto: CreateRevenueShareDto,
    requesterId: string,
  ): Promise<RevenueShare> {
    // Check if user has permission
    const permission = await this.bandsService.checkMemberPermission(bandId, requesterId);
    if (!permission || permission !== MemberPermission.ADMIN) {
      throw new ForbiddenException('Only admins can create revenue shares');
    }

    // Validate that member belongs to the band
    const band = await this.bandsService.findOne(bandId);
    const member = band.members.find(m => m.id === createRevenueShareDto.memberId);
    if (!member) {
      throw new NotFoundException('Member not found in this band');
    }

    // Check if total percentage for this revenue type doesn't exceed 100%
    await this.validateTotalPercentage(bandId, createRevenueShareDto.revenueType, createRevenueShareDto.percentage);

    const revenueShare = this.revenueShareRepository.create({
      ...createRevenueShareDto,
      bandId,
      effectiveDate: new Date(createRevenueShareDto.effectiveDate),
      endDate: createRevenueShareDto.endDate ? new Date(createRevenueShareDto.endDate) : null,
    });

    return this.revenueShareRepository.save(revenueShare);
  }

  async findByBand(bandId: string): Promise<RevenueShare[]> {
    return this.revenueShareRepository.find({
      where: { bandId },
      relations: ['member', 'member.user'],
      order: { revenueType: 'ASC', effectiveDate: 'DESC' },
    });
  }

  async findByMember(bandId: string, memberId: string): Promise<RevenueShare[]> {
    return this.revenueShareRepository.find({
      where: { bandId, memberId },
      relations: ['member', 'member.user'],
      order: { revenueType: 'ASC', effectiveDate: 'DESC' },
    });
  }

  async updateRevenueShare(
    shareId: string,
    updateRevenueShareDto: UpdateRevenueShareDto,
    requesterId: string,
  ): Promise<RevenueShare> {
    const revenueShare = await this.revenueShareRepository.findOne({
      where: { id: shareId },
      relations: ['band', 'member'],
    });

    if (!revenueShare) {
      throw new NotFoundException('Revenue share not found');
    }

    // Check if user has permission
    const permission = await this.bandsService.checkMemberPermission(revenueShare.bandId, requesterId);
    if (!permission || permission !== MemberPermission.ADMIN) {
      throw new ForbiddenException('Only admins can update revenue shares');
    }

    // If percentage is being updated, validate total doesn't exceed 100%
    if (updateRevenueShareDto.percentage !== undefined) {
      await this.validateTotalPercentage(
        revenueShare.bandId,
        revenueShare.revenueType,
        updateRevenueShareDto.percentage,
        shareId,
      );
    }

    await this.revenueShareRepository.update(shareId, {
      ...updateRevenueShareDto,
      endDate: updateRevenueShareDto.endDate ? new Date(updateRevenueShareDto.endDate) : undefined,
    });

    return this.revenueShareRepository.findOne({
      where: { id: shareId },
      relations: ['member', 'member.user'],
    });
  }

  async deleteRevenueShare(shareId: string, requesterId: string): Promise<void> {
    const revenueShare = await this.revenueShareRepository.findOne({
      where: { id: shareId },
      relations: ['band'],
    });

    if (!revenueShare) {
      throw new NotFoundException('Revenue share not found');
    }

    // Check if user has permission
    const permission = await this.bandsService.checkMemberPermission(revenueShare.bandId, requesterId);
    if (!permission || permission !== MemberPermission.ADMIN) {
      throw new ForbiddenException('Only admins can delete revenue shares');
    }

    await this.revenueShareRepository.delete(shareId);
  }

  async getRevenueDistribution(bandId: string, revenueType: RevenueType): Promise<{
    shares: RevenueShare[];
    totalPercentage: number;
    remainingPercentage: number;
  }> {
    const shares = await this.revenueShareRepository.find({
      where: {
        bandId,
        revenueType,
        status: ShareStatus.ACTIVE,
      },
      relations: ['member', 'member.user'],
    });

    const totalPercentage = shares.reduce((sum, share) => sum + Number(share.percentage), 0);
    const remainingPercentage = 100 - totalPercentage;

    return {
      shares,
      totalPercentage,
      remainingPercentage,
    };
  }

  async calculateMemberRevenue(
    bandId: string,
    memberId: string,
    revenueType: RevenueType,
    totalRevenue: number,
  ): Promise<number> {
    const activeShares = await this.revenueShareRepository.find({
      where: {
        bandId,
        memberId,
        revenueType,
        status: ShareStatus.ACTIVE,
      },
    });

    const totalPercentage = activeShares.reduce((sum, share) => {
      // Check conditions
      if (share.conditions?.minimumAmount && totalRevenue < share.conditions.minimumAmount) {
        return sum;
      }
      if (share.conditions?.maximumAmount && totalRevenue > share.conditions.maximumAmount) {
        return sum;
      }
      return sum + Number(share.percentage);
    }, 0);

    return (totalRevenue * totalPercentage) / 100;
  }

  private async validateTotalPercentage(
    bandId: string,
    revenueType: RevenueType,
    newPercentage: number,
    excludeShareId?: string,
  ): Promise<void> {
    const query = this.revenueShareRepository
      .createQueryBuilder('share')
      .where('share.bandId = :bandId', { bandId })
      .andWhere('share.revenueType = :revenueType', { revenueType })
      .andWhere('share.status = :status', { status: ShareStatus.ACTIVE });

    if (excludeShareId) {
      query.andWhere('share.id != :excludeShareId', { excludeShareId });
    }

    const existingShares = await query.getMany();
    const currentTotal = existingShares.reduce((sum, share) => sum + Number(share.percentage), 0);
    const newTotal = currentTotal + newPercentage;

    if (newTotal > 100) {
      throw new BadRequestException(
        `Total percentage cannot exceed 100%. Current: ${currentTotal}%, Trying to add: ${newPercentage}%`,
      );
    }
  }

  async getBandRevenueOverview(bandId: string): Promise<{
    [key in RevenueType]: {
      totalAllocated: number;
      remainingPercentage: number;
      memberShares: Array<{
        memberId: string;
        memberName: string;
        percentage: number;
      }>;
    };
  }> {
    const overview = {} as any;

    for (const revenueType of Object.values(RevenueType)) {
      const distribution = await this.getRevenueDistribution(bandId, revenueType);
      
      overview[revenueType] = {
        totalAllocated: distribution.totalPercentage,
        remainingPercentage: distribution.remainingPercentage,
        memberShares: distribution.shares.map(share => ({
          memberId: share.memberId,
          memberName: share.member.user.name || share.member.user.username,
          percentage: Number(share.percentage),
        })),
      };
    }

    return overview;
  }
}