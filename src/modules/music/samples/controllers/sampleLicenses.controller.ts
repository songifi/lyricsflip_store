import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SampleLicensesService } from '../services/sample-licenses.service';
import { CreateLicenseDto, PurchaseLicenseDto } from '../dto/create-license.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { LicenseType } from '../entities/sample-license.entity';

@ApiTags('sample-licenses')
@Controller('sample-licenses')
export class SampleLicensesController {
  constructor(private readonly licensesService: SampleLicensesService) {}

  @Post('samples/:sampleId/license')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a license for a sample' })
  @ApiResponse({ status: 201, description: 'License created successfully' })
  createLicense(
    @Param('sampleId') sampleId: string,
    @Body() createLicenseDto: CreateLicenseDto,
    @Request() req,
  ) {
    return this.licensesService.createLicense(sampleId, createLicenseDto, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a license by ID' })
  @ApiResponse({ status: 200, description: 'License retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.licensesService.findOne(id);
  }

  @Get('user/licenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user licenses' })
  @ApiResponse({ status: 200, description: 'User licenses retrieved successfully' })
  getUserLicenses(@Request() req) {
    return this.licensesService.findUserLicenses(req.user.id);
  }

  @Get('samples/:sampleId/licenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get licenses for a sample' })
  @ApiResponse({ status: 200, description: 'Sample licenses retrieved successfully' })
  getSampleLicenses(@Param('sampleId') sampleId: string) {
    return this.licensesService.findSampleLicenses(sampleId);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a license' })
  @ApiResponse({ status: 200, description: 'License activated successfully' })
  activateLicense(@Param('id') id: string) {
    return this.licensesService.activateLicense(id);
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a license' })
  @ApiResponse({ status: 200, description: 'License revoked successfully' })
  revokeLicense(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.licensesService.revokeLicense(id, body.reason);
  }

  @Get('license-types/:type/terms')
  @ApiOperation({ summary: 'Get default terms for license type' })
  @ApiResponse({ status: 200, description: 'License terms retrieved successfully' })
  getLicenseTerms(@Param('type') type: LicenseType) {
    return this.licensesService.getLicenseTermsForType(type);
  }

  @Post(':id/validate-usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate license usage' })
  @ApiResponse({ status: 200, description: 'License usage validated' })
  validateUsage(
    @Param('id') id: string,
    @Body() body: { usageType: string; distributionCount?: number },
  ) {
    return this.licensesService.validateLicenseUsage(
      id,
      body.usageType,
      body.distributionCount,
    );
  }
}