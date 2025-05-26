import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BrandingService } from '../services/branding.service';
import { CreateBrandingDto } from '../dto/create-branding.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('branding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('labels/:labelId/branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Post()
  @ApiOperation({ summary: 'Create branding asset' })
  @ApiResponse({ status: 201, description: 'Branding asset created successfully' })
  create(
    @Param('labelId') labelId: string,
    @Body() createBrandingDto: CreateBrandingDto,
  ) {
    return this.brandingService.create(labelId, createBrandingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branding assets' })
  @ApiResponse({ status: 200, description: 'Branding assets retrieved successfully' })
  findAll(
    @Param('labelId') labelId: string,
    @Query('type') type?: string,
  ) {
    if (type) {
      return this.brandingService.findByType(labelId, type);
    }
    return this.brandingService.findAll(labelId);
  }

  @Get('kit')
  @ApiOperation({ summary: 'Get complete branding kit' })
  @ApiResponse({ status: 200, description: 'Branding kit retrieved successfully' })
  getBrandingKit(@Param('labelId') labelId: string) {
    return this.brandingService.getBrandingKit(labelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branding asset by ID' })
  @ApiResponse({ status: 200, description: 'Branding asset retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.brandingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branding asset' })
  @ApiResponse({ status: 200, description: 'Branding asset updated successfully' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.brandingService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branding asset' })
  @ApiResponse({ status: 200, description: 'Branding asset deleted successfully' })
  remove(@Param('id') id: string) {
    return this.brandingService.remove(id);
  }

  @Post('apply/:artistId')
  @ApiOperation({ summary: 'Apply label branding to artist' })
  @ApiResponse({ status: 200, description: 'Branding applied successfully' })
  applyToArtist(
    @Param('labelId') labelId: string,
    @Param('artistId') artistId: string,
  ) {
    return this.brandingService.applyBrandingToArtist(labelId, artistId);
  }
}