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
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SamplePacksService } from '../services/sample-packs.service';
import { CreateSamplePackDto, UpdateSamplePackDto } from '../dto/create-sample-pack.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('sample-packs')
@Controller('sample-packs')
export class SamplePacksController {
  constructor(private readonly samplePacksService: SamplePacksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sample pack' })
  @ApiResponse({ status: 201, description: 'Sample pack created successfully' })
  create(@Body() createSamplePackDto: CreateSamplePackDto, @Request() req) {
    return this.samplePacksService.create(createSamplePackDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sample packs' })
  @ApiResponse({ status: 200, description: 'Sample packs retrieved successfully' })
  findAll(@Query('creatorId') creatorId?: string) {
    return this.samplePacksService.findAll(creatorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sample pack by ID' })
  @ApiResponse({ status: 200, description: 'Sample pack retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.samplePacksService.findOne(id);
  }

  @Get(':id/value')
  @ApiOperation({ summary: 'Calculate sample pack value and savings' })
  @ApiResponse({ status: 200, description: 'Pack value calculated successfully' })
  calculateValue(@Param('id') id: string) {
    return this.samplePacksService.calculatePackValue(id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sample pack analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getAnalytics(@Param('id') id: string, @Request() req) {
    return this.samplePacksService.getPackAnalytics(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a sample pack' })
  @ApiResponse({ status: 200, description: 'Sample pack updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateSamplePackDto: UpdateSamplePackDto,
    @Request() req,
  ) {
    return this.samplePacksService.update(id, updateSamplePackDto, req.user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a sample pack' })
  @ApiResponse({ status: 200, description: 'Sample pack published successfully' })
  publish(@Param('id') id: string, @Request() req) {
    return this.samplePacksService.publish(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sample pack' })
  @ApiResponse({ status: 204, description: 'Sample pack deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.samplePacksService.remove(id, req.user.id);
  }
}