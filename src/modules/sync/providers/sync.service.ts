import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { type Repository, type FindManyOptions, Like, Between } from "typeorm"
import { type SyncLicense, SyncLicenseStatus } from "../../database/entities/sync-license.entity"
import type { CreateSyncLicenseDto } from "./dto/create-sync-license.dto"
import type { UpdateSyncLicenseDto } from "./dto/update-sync-license.dto"
import type { SyncLicenseQueryDto } from "./dto/sync-license-query.dto"
import type { SyncFeeService } from "./services/sync-fee.service"

@Injectable()
export class SyncService {
  constructor(
    private readonly syncLicenseRepository: Repository<SyncLicense>,
    private readonly syncFeeService: SyncFeeService,
  ) {}

  async createLicense(createSyncLicenseDto: CreateSyncLicenseDto): Promise<SyncLicense> {
    // Generate unique license number
    const licenseNumber = await this.generateLicenseNumber()

    // Calculate license fee if not provided
    let licenseFee = createSyncLicenseDto.licenseFee
    if (!licenseFee) {
      licenseFee = await this.syncFeeService.calculateFee(createSyncLicenseDto)
    }

    const syncLicense = this.syncLicenseRepository.create({
      ...createSyncLicenseDto,
      licenseNumber,
      licenseFee,
    })

    const savedLicense = await this.syncLicenseRepository.save(syncLicense)

    // Create fee calculation record
    await this.syncFeeService.createFeeCalculation(savedLicense.id, {
      baseFee: licenseFee,
      calculatedFee: licenseFee,
      finalFee: licenseFee,
      calculationDetails: {
        factors: {},
        adjustments: {},
        notes: "Initial license creation",
      },
    })

    return savedLicense
  }

  async getLicenses(query: SyncLicenseQueryDto): Promise<{
    data: SyncLicense[]
    total: number
    page: number
    limit: number
  }> {
    const { page = 1, limit = 10, search, status, mediaType, clientId, startDate, endDate } = query

    const findOptions: FindManyOptions<SyncLicense> = {
      relations: ["track", "mediaProject", "client"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    }

    const where: any = {}

    if (search) {
      where.licenseNumber = Like(`%${search}%`)
    }

    if (status) {
      where.status = status
    }

    if (mediaType) {
      where.mediaType = mediaType
    }

    if (clientId) {
      where.client = { id: clientId }
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate))
    }

    findOptions.where = where

    const [data, total] = await this.syncLicenseRepository.findAndCount(findOptions)

    return {
      data,
      total,
      page,
      limit,
    }
  }

  async getLicense(id: string): Promise<SyncLicense> {
    const license = await this.syncLicenseRepository.findOne({
      where: { id },
      relations: ["track", "mediaProject", "client", "usageReports", "feeCalculations"],
    })

    if (!license) {
      throw new NotFoundException("Sync license not found")
    }

    return license
  }

  async updateLicense(id: string, updateSyncLicenseDto: UpdateSyncLicenseDto): Promise<SyncLicense> {
    const license = await this.getLicense(id)

    // Prevent updates to approved/active licenses without proper workflow
    if (license.status === SyncLicenseStatus.APPROVED || license.status === SyncLicenseStatus.ACTIVE) {
      throw new BadRequestException("Cannot update approved or active licenses directly")
    }

    Object.assign(license, updateSyncLicenseDto)
    return this.syncLicenseRepository.save(license)
  }

  async deleteLicense(id: string): Promise<void> {
    const license = await this.getLicense(id)

    // Prevent deletion of active licenses
    if (license.status === SyncLicenseStatus.ACTIVE) {
      throw new BadRequestException("Cannot delete active licenses")
    }

    await this.syncLicenseRepository.remove(license)
  }

  async getDashboardStats(): Promise<any> {
    const totalLicenses = await this.syncLicenseRepository.count()
    const activeLicenses = await this.syncLicenseRepository.count({
      where: { status: SyncLicenseStatus.ACTIVE },
    })
    const pendingLicenses = await this.syncLicenseRepository.count({
      where: { status: SyncLicenseStatus.PENDING },
    })

    const totalRevenue = await this.syncLicenseRepository
      .createQueryBuilder("license")
      .select("SUM(license.licenseFee)", "total")
      .where("license.status IN (:...statuses)", {
        statuses: [SyncLicenseStatus.APPROVED, SyncLicenseStatus.ACTIVE],
      })
      .getRawOne()

    const monthlyStats = await this.syncLicenseRepository
      .createQueryBuilder("license")
      .select([
        "EXTRACT(YEAR FROM license.createdAt) as year",
        "EXTRACT(MONTH FROM license.createdAt) as month",
        "COUNT(*) as count",
        "SUM(license.licenseFee) as revenue",
      ])
      .where("license.createdAt >= :date", { date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) })
      .groupBy("EXTRACT(YEAR FROM license.createdAt), EXTRACT(MONTH FROM license.createdAt)")
      .orderBy("year, month")
      .getRawMany()

    return {
      totalLicenses,
      activeLicenses,
      pendingLicenses,
      totalRevenue: totalRevenue?.total || 0,
      monthlyStats,
    }
  }

  private async generateLicenseNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.syncLicenseRepository.count()
    return `SL-${year}-${String(count + 1).padStart(6, "0")}`
  }
}
