import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common"
import { type Repository, In } from "typeorm"
import { Contest, ContestStatus } from "../entities/contest.entity"
import { type ContestSubmission, SubmissionStatus } from "../entities/contest-submission.entity"
import type { CreateContestDto } from "../dto/create-contest.dto"
import type { UpdateContestDto } from "../dto/update-contest.dto"
import type { PaginationDto } from "../../../common/dto/pagination.dto"

@Injectable()
export class ContestService {
  constructor(
    private contestRepository: Repository<Contest>,
    private submissionRepository: Repository<ContestSubmission>,
  ) {}

  async create(createContestDto: CreateContestDto, organizerId: string): Promise<Contest> {
    // Validate dates
    const submissionStart = new Date(createContestDto.submissionStartDate)
    const submissionEnd = new Date(createContestDto.submissionEndDate)
    const votingStart = new Date(createContestDto.votingStartDate)
    const votingEnd = new Date(createContestDto.votingEndDate)

    if (submissionStart >= submissionEnd) {
      throw new BadRequestException("Submission end date must be after start date")
    }

    if (votingStart >= votingEnd) {
      throw new BadRequestException("Voting end date must be after start date")
    }

    if (submissionEnd > votingStart) {
      throw new BadRequestException("Voting must start after submission period ends")
    }

    const contest = this.contestRepository.create({
      ...createContestDto,
      organizerId,
      submissionStartDate: submissionStart,
      submissionEndDate: submissionEnd,
      votingStartDate: votingStart,
      votingEndDate: votingEnd,
      announcementDate: createContestDto.announcementDate ? new Date(createContestDto.announcementDate) : null,
    })

    return this.contestRepository.save(contest)
  }

  async findAll(
    paginationDto: PaginationDto,
    filters?: any,
  ): Promise<{
    contests: Contest[]
    total: number
    page: number
    limit: number
  }> {
    const { page = 1, limit = 10 } = paginationDto
    const skip = (page - 1) * limit

    const queryBuilder = this.contestRepository
      .createQueryBuilder("contest")
      .leftJoinAndSelect("contest.organizer", "organizer")
      .leftJoinAndSelect("contest.prizes", "prizes")
      .where("contest.isPublic = :isPublic", { isPublic: true })

    if (filters?.status) {
      queryBuilder.andWhere("contest.status = :status", { status: filters.status })
    }

    if (filters?.type) {
      queryBuilder.andWhere("contest.type = :type", { type: filters.type })
    }

    if (filters?.isFeatured) {
      queryBuilder.andWhere("contest.isFeatured = :isFeatured", { isFeatured: true })
    }

    if (filters?.search) {
      queryBuilder.andWhere("(contest.title ILIKE :search OR contest.description ILIKE :search)", {
        search: `%${filters.search}%`,
      })
    }

    const [contests, total] = await queryBuilder
      .orderBy("contest.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      contests,
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<Contest> {
    const contest = await this.contestRepository.findOne({
      where: { id },
      relations: ["organizer", "submissions", "prizes", "votes"],
    })

    if (!contest) {
      throw new NotFoundException("Contest not found")
    }

    // Increment view count
    await this.contestRepository.increment({ id }, "viewCount", 1)

    return contest
  }

  async update(id: string, updateContestDto: UpdateContestDto, userId: string): Promise<Contest> {
    const contest = await this.findOne(id)

    if (contest.organizerId !== userId) {
      throw new ForbiddenException("Only the organizer can update this contest")
    }

    if (contest.status === ContestStatus.ACTIVE || contest.status === ContestStatus.COMPLETED) {
      throw new BadRequestException("Cannot update an active or completed contest")
    }

    Object.assign(contest, updateContestDto)
    return this.contestRepository.save(contest)
  }

  async remove(id: string, userId: string): Promise<void> {
    const contest = await this.findOne(id)

    if (contest.organizerId !== userId) {
      throw new ForbiddenException("Only the organizer can delete this contest")
    }

    if (contest.status === ContestStatus.ACTIVE) {
      throw new BadRequestException("Cannot delete an active contest")
    }

    await this.contestRepository.remove(contest)
  }

  async updateStatus(): Promise<void> {
    const now = new Date()

    // Update contests to ACTIVE status
    await this.contestRepository
      .createQueryBuilder()
      .update(Contest)
      .set({ status: ContestStatus.ACTIVE })
      .where("status = :status", { status: ContestStatus.UPCOMING })
      .andWhere("submissionStartDate <= :now", { now })
      .andWhere("submissionEndDate > :now", { now })
      .execute()

    // Update contests to VOTING status
    await this.contestRepository
      .createQueryBuilder()
      .update(Contest)
      .set({ status: ContestStatus.VOTING })
      .where("status = :status", { status: ContestStatus.ACTIVE })
      .andWhere("votingStartDate <= :now", { now })
      .andWhere("votingEndDate > :now", { now })
      .execute()

    // Update contests to COMPLETED status
    await this.contestRepository
      .createQueryBuilder()
      .update(Contest)
      .set({ status: ContestStatus.COMPLETED })
      .where("status = :status", { status: ContestStatus.VOTING })
      .andWhere("votingEndDate <= :now", { now })
      .execute()
  }

  async getContestStats(id: string): Promise<any> {
    const contest = await this.findOne(id)

    const submissionStats = await this.submissionRepository
      .createQueryBuilder("submission")
      .select([
        "COUNT(*) as totalSubmissions",
        "COUNT(CASE WHEN submission.status = :approved THEN 1 END) as approvedSubmissions",
        "COUNT(CASE WHEN submission.status = :pending THEN 1 END) as pendingSubmissions",
        "COUNT(CASE WHEN submission.status = :rejected THEN 1 END) as rejectedSubmissions",
      ])
      .where("submission.contestId = :contestId", { contestId: id })
      .setParameter("approved", SubmissionStatus.APPROVED)
      .setParameter("pending", SubmissionStatus.PENDING)
      .setParameter("rejected", SubmissionStatus.REJECTED)
      .getRawOne()

    const topSubmissions = await this.submissionRepository.find({
      where: { contestId: id, status: SubmissionStatus.APPROVED },
      relations: ["user", "track"],
      order: { voteCount: "DESC" },
      take: 10,
    })

    return {
      contest,
      stats: submissionStats,
      topSubmissions,
    }
  }

  async getFeaturedContests(): Promise<Contest[]> {
    return this.contestRepository.find({
      where: { isFeatured: true, isPublic: true },
      relations: ["organizer", "prizes"],
      order: { createdAt: "DESC" },
      take: 6,
    })
  }

  async getActiveContests(): Promise<Contest[]> {
    return this.contestRepository.find({
      where: {
        status: In([ContestStatus.ACTIVE, ContestStatus.VOTING]),
        isPublic: true,
      },
      relations: ["organizer", "prizes"],
      order: { participantCount: "DESC" },
    })
  }
}
