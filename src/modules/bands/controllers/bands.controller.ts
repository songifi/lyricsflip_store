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
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MemberPermission } from '../../database/entities/band-member.entity';

@Controller('bands')
@UseGuards(JwtAuthGuard)
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @Post()
  async create(@Body() createBandDto: CreateBandDto, @Request() req) {
    return this.bandsService.createBand(createBandDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query('my') my?: string) {
    const userId = my === 'true' ? req.user.id : undefined;
    return this.bandsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bandsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBandDto: UpdateBandDto,
    @Request() req,
  ) {
    return this.bandsService.updateBand(id, updateBandDto, req.user.id);
  }

  @Delete(':id')
  async disband(@Param('id') id: string, @Request() req) {
    await this.bandsService.disbandBand(id, req.user.id);
    return { message: 'Band disbanded successfully' };
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    return this.bandsService.addMember(id, addMemberDto, req.user.id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.bandsService.getBandMembers(id);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    await this.bandsService.removeMember(id, memberId, req.user.id);
    return { message: 'Member removed successfully' };
  }

  @Patch(':id/members/:memberId/permission')
  async updateMemberPermission(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body('permission') permission: MemberPermission,
    @Request() req,
  ) {
    return this.bandsService.updateMemberPermission(id, memberId, permission, req.user.id);
  }

  @Get(':id/permission')
  async checkPermission(@Param('id') id: string, @Request() req) {
    const permission = await this.bandsService.checkMemberPermission(id, req.user.id);
    return { permission };
  }
}