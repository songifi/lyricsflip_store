import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LabelsService } from '../services/labels.service';
import { CreateLabelDto } from '../dto/create-label.dto';
import { UpdateLabelDto } from '../dto/update-label.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('labels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record label' })
  @ApiResponse({ status: 201, description: 'Label created successfully' })
  create(@Body() createLabelDto: CreateLabelDto, @Request() req) {
    return this.labelsService.create(createLabelDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all labels' })
  @ApiResponse({ status: 200, description: 'Labels retrieved successfully' })
  findAll(@Query('owner') ownerId?: string) {
    return this.labelsService.findAll(ownerId);
  }

  @Get('my-labels')
  @ApiOperation({ summary: 'Get current user labels' })
  @ApiResponse({ status: 200, description: 'User labels retrieved successfully' })
  findMyLabels(@Request() req) {
    return this.labelsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get label by ID' })
  @ApiResponse({ status: 200, description: 'Label retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.labelsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get label by slug' })
  @ApiResponse({ status: 200, description: 'Label retrieved successfully' })
  findBySlug(@Param('slug') slug: string) {
    return this.labelsService.findBySlug(slug);
  }

  @Get(':id/roster')
  @ApiOperation({ summary: 'Get label artist roster' })
  @ApiResponse({ status: 200, description: 'Roster retrieved successfully' })
  getRoster(@Param('id') id: string) {
    return this.labelsService.getLabelRoster(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get label analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getAnalytics(@Param('id') id: string) {
    return this.labelsService.getLabelAnalytics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update label' })
  @ApiResponse({ status: 200, description: 'Label updated successfully' })
  update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
    return this.labelsService.update(id, updateLabelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete label' })
  @ApiResponse({ status: 200, description: 'Label deleted successfully' })
  remove(@Param('id') id: string) {
    return this.labelsService.remove(id);
  }
}