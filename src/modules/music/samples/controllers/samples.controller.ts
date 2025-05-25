import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SamplesService } from '../services/samples.service';
import { CreateSampleDto, UpdateSampleDto, SampleQueryDto } from '../dto/create-sample.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UsageType, UsageContext } from '../entities/sample-usage.entity';

@ApiTags('samples')
@Controller('samples')
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sample' })
  @ApiResponse({ status: 201, description: 'Sample created successfully' })
  create(@Body() createSampleDto: CreateSampleDto, @Request() req) {
    return this.samplesService.create(createSampleDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all samples with filtering' })
  @ApiResponse({ status: 200, description: 'Samples retrieved successfully' })
  findAll(@Query() query: SampleQueryDto) {
    return this.samplesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sample by ID' })
  @ApiResponse({ status: 200, description: 'Sample retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.samplesService.findOne(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get sample preview URL' })
  @ApiResponse({ status: 200, description: 'Preview URL retrieved successfully' })
  async getPreview(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    const previewUrl = await this.samplesService.getPreviewUrl(id, userId);
    return { previewUrl };
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sample download URL' })
  @ApiResponse({ status: 200, description: 'Download URL retrieved successfully' })
  async getDownload(@Param('id') id: string, @Request() req) {
    const downloadUrl = await this.samplesService.getDownloadUrl(id, req.user.id);
    return { downloadUrl };
  }

  @Post(':id/track-usage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track sample usage' })
  @ApiResponse({ status: 204, description: 'Usage tracked successfully' })
  async trackUsage(
    @Param('id') id: string,
    @Body() body: {
      type: UsageType;
      context?: UsageContext;
      metadata?: any;
    },
    @Request() req,
  ) {
    const userId = req.user?.id;
    await this.samplesService.trackUsage(
      id,
      body.type,
      body.context,
      userId,
      body.metadata,
    );
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sample analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getAnalytics(@Param('id') id: string, @Request() req) {
    return this.samplesService.getSampleAnalytics(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a sample' })
  @ApiResponse({ status: 200, description: 'Sample updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDto,
    @Request() req,
  ) {
    return this.samplesService.update(id, updateSampleDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sample' })
  @ApiResponse({ status: 204, description: 'Sample deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.samplesService.remove(id, req.user.id);
  }
}