import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipation } from './entities/challenge-participation.entity';
import { User } from '../../users/entities/user.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ParticipateChallengeDto } from './dto/participate-challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,

    @InjectRepository(ChallengeParticipation)
    private readonly participationRepo: Repository<ChallengeParticipation>,
  ) {}

  async createChallenge(user: User, dto: CreateChallengeDto): Promise<Challenge> {
    const challenge = this.challengeRepo.create({
      title: dto.title,
      description: dto.description,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      creator: user,
    });
    return this.challengeRepo.save(challenge);
  }

  async participateInChallenge(user: User, dto: ParticipateChallengeDto): Promise<ChallengeParticipation> {
    const challenge = await this.challengeRepo.findOne({ where: { id: dto.challengeId } });
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      throw new BadRequestException('Challenge is not currently active');
    }

    // Check if user already participated
    const existingParticipation = await this.participationRepo.findOne({
      where: { participant: { id: user.id }, challenge: { id: dto.challengeId } },
    });
    if (existingParticipation) {
      throw new BadRequestException('Already participated in this challenge');
    }

    const participation = this.participationRepo.create({
      participant: user,
      challenge,
      submissionUrl: dto.submissionUrl,
      status: 'pending',
    });
    return this.participationRepo.save(participation);
  }
}
