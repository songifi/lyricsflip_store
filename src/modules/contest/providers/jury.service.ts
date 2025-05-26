import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type ContestJury, JuryStatus } from "../entities/contest-jury.entity"
import type { Contest } from "../entities/contest.entity"
import type { User } from "../../users/entities/user.entity"
import type { NotificationService } from "../../notifications/services/notification.service"

@Injectable()
export class JuryService {
  constructor(
    private juryRepository: Repository<ContestJury>,
    private contestRepository: Repository<Contest>,
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  async inviteJury(contestId: string, userId: string, expertise?: string, votingWeight = 1.0): Promise<ContestJury> {
    const contest = await this.contestRepository.findOne({
      where: { id: contestId },
    })

    if (!contest) {
      throw new NotFoundException("Contest not found")
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Check if already invited
    const existingJury = await this.juryRepository.findOne({
      where: { contestId, userId },
    })

    if (existingJury) {
      throw new BadRequestException("User is already invited as jury")
    }

    const jury = this.juryRepository.create({
      contestId,
      userId,
      expertise,
      votingWeight,
      invitedAt: new Date(),
    })

    const savedJury = await this.juryRepository.save(jury)

    // Send notification to invited jury
    await this.notificationService.sendNotification({
      userId,
      type: "JURY_INVITATION",
      title: "Jury Invitation",
      message: `You have been invited to be a jury member for the contest "${contest.title}"`,
      data: {
        contestId,
        juryId: savedJury.id,
      },
    })

    return savedJury
  }

  async respondToInvitation(juryId: string, userId: string, accept: boolean): Promise<ContestJury> {
    const jury = await this.juryRepository.findOne({
      where: { id: juryId, userId },
      relations: ["contest"],
    })

    if (!jury) {
      throw new NotFoundException("Jury invitation not found")
    }

    if (jury.status !== JuryStatus.INVITED) {
      throw new BadRequestException("Invitation has already been responded to")
    }

    jury.status = accept ? JuryStatus.ACCEPTED : JuryStatus.DECLINED
    jury.respondedAt = new Date()

    return this.juryRepository.save(jury)
  }

  async getContestJury(contestId: string): Promise<ContestJury[]> {
    return this.juryRepository.find({
      where: { contestId },
      relations: ["user"],
      order: { createdAt: "ASC" },
    })
  }

  async removeJury(juryId: string): Promise<void> {
    const jury = await this.juryRepository.findOne({
      where: { id: juryId },
    })

    if (!jury) {
      throw new NotFoundException("Jury member not found")
    }

    jury.status = JuryStatus.REMOVED
    await this.juryRepository.save(jury)
  }

  async updateJuryWeight(juryId: string, votingWeight: number): Promise<ContestJury> {
    const jury = await this.juryRepository.findOne({
      where: { id: juryId },
    })

    if (!jury) {
      throw new NotFoundException("Jury member not found")
    }

    jury.votingWeight = votingWeight
    return this.juryRepository.save(jury)
  }

  async getUserJuryInvitations(userId: string): Promise<ContestJury[]> {
    return this.juryRepository.find({
      where: { userId },
      relations: ["contest"],
      order: { createdAt: "DESC" },
    })
  }
}
