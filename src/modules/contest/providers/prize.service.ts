import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ContestPrize, PrizeStatus } from "../entities/contest-prize.entity"
import { ContestSubmission } from "../entities/contest-submission.entity"
import { Contest, ContestStatus } from "../entities/contest.entity"
import type { CreatePrizeDto } from "../dto/create-prize.dto"
import type { NotificationService } from "../../notifications/services/notification.service"

@Injectable()
export class PrizeService {
  constructor(
    private prizeRepository: Repository<ContestPrize>,
    private contestRepository: Repository<Contest>,
    private submissionRepository: Repository<ContestSubmission>,
    private notificationService: NotificationService,
    @InjectRepository(ContestPrize) prizeRepositoryInjection: Repository<ContestPrize>,
    @InjectRepository(Contest) contestRepositoryInjection: Repository<Contest>,
    @InjectRepository(ContestSubmission) submissionRepositoryInjection: Repository<ContestSubmission>,
  ) {
    this.prizeRepository = prizeRepositoryInjection
    this.contestRepository = contestRepositoryInjection
    this.submissionRepository = submissionRepositoryInjection
  }

  async createPrize(contestId: string, createPrizeDto: CreatePrizeDto): Promise<ContestPrize> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
    })

    if (!contest) {
      throw new NotFoundException("Contest not found")
    }

    // Check if position already exists
    const existingPrize = await this.prizeRepository.findOne({
      where: { contestId, position: createPrizeDto.position },
    })

    if (existingPrize) {
      throw new BadRequestException(`Prize for position ${createPrizeDto.position} already exists`)
    }

    const prize = this.prizeRepository.create({
      ...createPrizeDto,
      contestId,
      expiresAt: createPrizeDto.expiresAt ? new Date(createPrizeDto.expiresAt) : null,
    })

    return this.prizeRepository.save(prize)
  }

  async getPrizes(contestId: string): Promise<ContestPrize[]> {
    return this.prizeRepository.find({
      where: { contestId },
      relations: ["winner"],
      order: { position: "ASC" },
    })
  }

  async awardPrizes(contestId: string): Promise<void> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
    })

    if (!contest) {
      throw new NotFoundException("Contest not found")
    }

    if (contest.status !== ContestStatus.COMPLETED) {
      throw new BadRequestException("Contest must be completed to award prizes")
    }

    const prizes = await this.prizeRepository.find({
      where: { contestId },
      order: { position: "ASC" },
    })

    const winners = await this.submissionRepository.find({
      where: { contestId },
      relations: ["user"],
      order: { rank: "ASC" },
      take: prizes.length,
    })

    for (let i = 0; i < Math.min(prizes.length, winners.length); i++) {
      const prize = prizes[i]
      const winner = winners[i]

      if (prize.status === PrizeStatus.PENDING) {
        prize.winnerId = winner.userId
        prize.status = PrizeStatus.AWARDED
        prize.awardedAt = new Date()

        await this.prizeRepository.save(prize)

        // Mark submission as winner
        winner.isWinner = true
        winner.prizePosition = prize.position
        await this.submissionRepository.save(winner)

        // Send notification to winner
        await this.notificationService.sendNotification({
          userId: winner.userId,
          type: "PRIZE_AWARDED",
          title: "Congratulations! You won a prize!",
          message: `You won ${prize.title} in the contest "${contest.title}"`,
          data: {
            contestId,
            prizeId: prize.id,
            position: prize.position,
          },
        })
      }
    }
  }

  async claimPrize(prizeId: string, userId: string): Promise<ContestPrize> {
    const prize = await this.prizeRepository.findOne({
      where: { id: prizeId },
      relations: ["winner", "contest"],
    })

    if (!prize) {
      throw new NotFoundException("Prize not found")
    }

    if (prize.winnerId !== userId) {
      throw new BadRequestException("You are not the winner of this prize")
    }

    if (prize.status !== PrizeStatus.AWARDED) {
      throw new BadRequestException("Prize is not available for claiming")
    }

    if (prize.expiresAt && new Date() > prize.expiresAt) {
      prize.status = PrizeStatus.EXPIRED
      await this.prizeRepository.save(prize)
      throw new BadRequestException("Prize has expired")
    }

    prize.status = PrizeStatus.CLAIMED
    prize.claimedAt = new Date()

    return this.prizeRepository.save(prize)
  }

  async getUserPrizes(userId: string): Promise<ContestPrize[]> {
    return this.prizeRepository.find({
      where: { winnerId: userId },
      relations: ["contest"],
      order: { awardedAt: "DESC" },
    })
  }

  async updatePrize(id: string, updateData: Partial<ContestPrize>): Promise<ContestPrize> {
    const prize = await this.prizeRepository.findOne({
      where: { id },
    })

    if (!prize) {
      throw new NotFoundException("Prize not found")
    }

    Object.assign(prize, updateData)
    return this.prizeRepository.save(prize)
  }

  async deletePrize(id: string): Promise<void> {
    const prize = await this.prizeRepository.findOne({
      where: { id },
    })

    if (!prize) {
      throw new NotFoundException("Prize not found")
    }

    if (prize.status !== PrizeStatus.PENDING) {
      throw new BadRequestException("Cannot delete awarded or claimed prizes")
    }

    await this.prizeRepository.remove(prize)
  }
}
