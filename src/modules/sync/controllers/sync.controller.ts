import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { SyncService } from "./sync.service"
import type { SyncWorkflowService } from "./services/sync-workflow.service"
import type { CreateSyncLicenseDto } from "./dto/create-sync-license.dto"
import type { UpdateSyncLicenseDto } from "./dto/update-sync-license.dto"
import type { SyncLicenseQueryDto } from "./dto/sync-license-query.dto"
import type { ApproveSyncLicenseDto } from "./dto/approve-sync-license.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"

@ApiTags("Sync Licensing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sync")
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly syncWorkflowService: SyncWorkflowService,
  ) {}

  @Post('licenses')
  @ApiOperation({ summary: 'Create a new sync license' })
  @ApiResponse({ status: 201, description: 'Sync license created successfully' })
  async createLicense(@Body() createSyncLicenseDto: CreateSyncLicenseDto) {
    return this.syncService.createLicense(createSyncLicenseDto);
  }

  @Get('licenses')
  @ApiOperation({ summary: 'Get all sync licenses with filtering' })
  @ApiResponse({ status: 200, description: 'Sync licenses retrieved successfully' })
  async getLicenses(@Query() query: SyncLicenseQueryDto) {
    return this.syncService.getLicenses(query);
  }

  @Get('licenses/:id')
  @ApiOperation({ summary: 'Get sync license by ID' })
  @ApiResponse({ status: 200, description: 'Sync license retrieved successfully' })
  async getLicense(@Param('id') id: string) {
    return this.syncService.getLicense(id);
  }

  @Put("licenses/:id")
  @ApiOperation({ summary: "Update sync license" })
  @ApiResponse({ status: 200, description: "Sync license updated successfully" })
  async updateLicense(@Param('id') id: string, @Body() updateSyncLicenseDto: UpdateSyncLicenseDto) {
    return this.syncService.updateLicense(id, updateSyncLicenseDto)
  }

  @Delete('licenses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sync license' })
  @ApiResponse({ status: 204, description: 'Sync license deleted successfully' })
  async deleteLicense(@Param('id') id: string) {
    return this.syncService.deleteLicense(id);
  }

  @Post("licenses/:id/approve")
  @ApiOperation({ summary: "Approve sync license" })
  @ApiResponse({ status: 200, description: "Sync license approved successfully" })
  async approveLicense(@Param('id') id: string, @Body() approveSyncLicenseDto: ApproveSyncLicenseDto) {
    return this.syncWorkflowService.approveLicense(id, approveSyncLicenseDto)
  }

  @Post("licenses/:id/reject")
  @ApiOperation({ summary: "Reject sync license" })
  @ApiResponse({ status: 200, description: "Sync license rejected successfully" })
  async rejectLicense(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.syncWorkflowService.rejectLicense(id, body.reason)
  }

  @Get('licenses/:id/workflow-status')
  @ApiOperation({ summary: 'Get sync license workflow status' })
  @ApiResponse({ status: 200, description: 'Workflow status retrieved successfully' })
  async getWorkflowStatus(@Param('id') id: string) {
    return this.syncWorkflowService.getWorkflowStatus(id);
  }

  @Get("dashboard/stats")
  @ApiOperation({ summary: "Get sync licensing dashboard statistics" })
  @ApiResponse({ status: 200, description: "Dashboard stats retrieved successfully" })
  async getDashboardStats() {
    return this.syncService.getDashboardStats()
  }
}
