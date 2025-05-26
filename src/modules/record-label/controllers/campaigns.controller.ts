import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CampaignsService } from '../services/campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('labels/:labelId/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new release campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  create(
    @Param('labelId') labelId: string,
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(labelId, createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns for a label' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  findAll(@Param('labelId') labelId: string) {
    return this.campaignsService.findAll(labelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update campaign status' })
  @ApiResponse({ status: 200, description: 'Campaign status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.campaignsService.updateStatus(id, status);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getAnalytics(@Param('id') id: string) {
    return this.campaignsService.getCampaignAnalytics(id);
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Create campaign task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  createTask(
    @Param('id') campaignId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.campaignsService.createTask(campaignId, createTaskDto);
  }

  @Patch('tasks/:taskId')
  @ApiOperation({ summary: 'Update campaign task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  updateTask(
    @Param('taskId') taskId: string,
    @Body() updateData: any,
  ) {
    return this.campaignsService.updateTask(taskId, updateData);
  }

  @Patch(':id/budget')
  @ApiOperation({ summary: 'Update campaign budget' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  updateBudget(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.campaignsService.updateBudget(id, amount);
  }
}