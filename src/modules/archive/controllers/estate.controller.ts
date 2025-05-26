import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EstateService } from '../services/estate.service';
import { CreateEstateDto } from '../dto/create-estate.dto';
import { UpdateEstateDto } from '../dto/update-estate.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EstateRights } from '../entities/estate-rights.entity';
import { EstateInheritance } from '../entities/estate-inheritance.entity';

@Controller('estates')
@UseGuards(JwtAuthGuard)
export class EstateController {
  constructor(private readonly estateService: EstateService) {}

  @Post()
  async create(@Body() createEstateDto: CreateEstateDto) {
    return await this.estateService.create(createEstateDto);
  }

  @Get()
  async findAll() {
    return await this.estateService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.estateService.findOne(id);
  }

  @Get('artist/:artistId')
  async findByArtist(@Param('artistId') artistId: string) {
    return await this.estateService.findByArtist(artistId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEstateDto: UpdateEstateDto) {
    return await this.estateService.update(id, updateEstateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.estateService.remove(id);
    return { message: 'Estate deleted successfully' };
  }

  @Post(':id/rights')
  async addRights(
    @Param('id') estateId: string,
    @Body() rightsData: Partial<EstateRights>,
  ) {
    return await this.estateService.addRights(estateId, rightsData);
  }

  @Post(':id/inheritances')
  async addInheritance(
    @Param('id') estateId: string,
    @Body() inheritanceData: Partial<EstateInheritance>,
  ) {
    return await this.estateService.addInheritance(estateId, inheritanceData);
  }

  @Get(':id/rights/breakdown')
  async getRightsBreakdown(@Param('id') estateId: string) {
    return await this.estateService.getRightsBreakdown(estateId);
  }

  @Get(':id/inheritances/breakdown')
  async getInheritanceBreakdown(@Param('id') estateId: string) {
    return await this.estateService.getInheritanceBreakdown(estateId);
  }

  @Get(':id/valuation')
  async getEstateValuation(@Param('id') estateId: string) {
    return await this.estateService.getEstateValuation(estateId);
  }
}