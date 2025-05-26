import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { SyncLicense, SyncLicenseStatus } from "../../../database/entities/sync-license.entity"
import type { ApproveSyncLicenseDto } from "../dto/approve-sync-license.dto"

@Injectable()
export class SyncWorkflowService {
  private readonly syncLicenseRepository: Repository<SyncLicense>

  constructor(
    @InjectRepository(SyncLicense)
    syncLicenseRepository: Repository<SyncLicense>,
  ) {
    this.syncLicenseRepository = syncLicenseRepository;
  }

  async approveLicense(id: string, approveSyncLicenseDto: ApproveSyncLicenseDto): Promise<SyncLicense> {
    const license = await this.syncLicenseRepository.findOne({
      where: { id },
      relations: ["track", "mediaProject", "client"],
    })

    if (!license) {
      throw new NotFoundException("Sync license not found")
    }

    if (license.status !== SyncLicenseStatus.PENDING) {
      throw new BadRequestException("Only pending licenses can be approved")
    }

    // Update license status and approval details
    license.status = SyncLicenseStatus.APPROVED
    license.approvedAt = new Date()
    license.approvedBy = approveSyncLicenseDto.approvedBy

    // Update any modified terms from approval
    if (approveSyncLicenseDto.modifiedTerms) {
      Object.assign(license.usageTerms, approveSyncLicenseDto.modifiedTerms)
    }

    if (approveSyncLicenseDto.modifiedFee) {
      license.licenseFee = approveSyncLicenseDto.modifiedFee
    }

    if (approveSyncLicenseDto.notes) {
      license.notes = license.notes
        ? `${license.notes}\n\nApproval Notes: ${approveSyncLicenseDto.notes}`
        : `Approval Notes: ${approveSyncLicenseDto.notes}`
    }

    const savedLicense = await this.syncLicenseRepository.save(license)

    // TODO: Send approval notification to client
    await this.sendApprovalNotification(savedLicense)

    return savedLicense
  }

  async rejectLicense(id: string, reason: string): Promise<SyncLicense> {
    const license = await this.syncLicenseRepository.findOne({
      where: { id },
      relations: ["track", "mediaProject", "client"],
    })

    if (!license) {
      throw new NotFoundException("Sync license not found")
    }

    if (license.status !== SyncLicenseStatus.PENDING) {
      throw new BadRequestException("Only pending licenses can be rejected")
    }

    license.status = SyncLicenseStatus.REJECTED
    license.notes = license.notes ? `${license.notes}\n\nRejection Reason: ${reason}` : `Rejection Reason: ${reason}`

    const savedLicense = await this.syncLicenseRepository.save(license)

    // TODO: Send rejection notification to client
    await this.sendRejectionNotification(savedLicense, reason)

    return savedLicense
  }

  async activateLicense(id: string): Promise<SyncLicense> {
    const license = await this.syncLicenseRepository.findOne({
      where: { id },
    })

    if (!license) {
      throw new NotFoundException("Sync license not found")
    }

    if (license.status !== SyncLicenseStatus.APPROVED) {
      throw new BadRequestException("Only approved licenses can be activated")
    }

    // Check if license is within valid date range
    const now = new Date()
    if (now < license.startDate) {
      throw new BadRequestException("License start date has not been reached")
    }

    if (now > license.endDate) {
      throw new BadRequestException("License has expired")
    }

    license.status = SyncLicenseStatus.ACTIVE
    return this.syncLicenseRepository.save(license)
  }

  async expireLicense(id: string): Promise<SyncLicense> {
    const license = await this.syncLicenseRepository.findOne({
      where: { id },
    })

    if (!license) {
      throw new NotFoundException("Sync license not found")
    }

    license.status = SyncLicenseStatus.EXPIRED
    return this.syncLicenseRepository.save(license)
  }

  async getWorkflowStatus(id: string): Promise<any> {
    const license = await this.syncLicenseRepository.findOne({
      where: { id },
      relations: ["track", "mediaProject", "client", "usageReports"],
    })

    if (!license) {
      throw new NotFoundException("Sync license not found")
    }

    const workflowSteps = [
      {
        step: "License Created",
        status: "completed",
        date: license.createdAt,
        description: "Sync license request submitted",
      },
      {
        step: "Under Review",
        status: license.status === SyncLicenseStatus.PENDING ? "current" : "completed",
        date: license.status !== SyncLicenseStatus.PENDING ? license.approvedAt : null,
        description: "License terms and conditions being reviewed",
      },
      {
        step: "Approved",
        status:
          license.status === SyncLicenseStatus.APPROVED
            ? "current"
            : license.status === SyncLicenseStatus.ACTIVE
              ? "completed"
              : "pending",
        date: license.approvedAt,
        description: "License approved and ready for activation",
      },
      {
        step: "Active",
        status: license.status === SyncLicenseStatus.ACTIVE ? "current" : "pending",
        date: license.status === SyncLicenseStatus.ACTIVE ? license.startDate : null,
        description: "License is active and music can be used",
      },
    ]

    return {
      license,
      currentStatus: license.status,
      workflowSteps,
      canApprove: license.status === SyncLicenseStatus.PENDING,
      canActivate: license.status === SyncLicenseStatus.APPROVED,
      canReject: license.status === SyncLicenseStatus.PENDING,
    }
  }

  private async sendApprovalNotification(license: SyncLicense): Promise<void> {
    // TODO: Implement email notification service
    console.log(`Sending approval notification for license ${license.licenseNumber} to ${license.client.contactEmail}`)
  }

  private async sendRejectionNotification(license: SyncLicense, reason: string): Promise<void> {
    // TODO: Implement email notification service
    console.log(`Sending rejection notification for license ${license.licenseNumber} to ${license.client.contactEmail}`)
  }
}
