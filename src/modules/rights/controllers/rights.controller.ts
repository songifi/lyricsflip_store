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
  ParseUUIDPipe,
} from '@nestjs/common';
import { RightsService } from '../services/rights.service';
import { CreateRightsDto } from '../dto/create-rights.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RightsStatus } from '../entities/rights.entity';

@Controller('rights')
@UseGuards(JwtAuthGuard)
export class RightsController {
  constructor(private readonly rightsService: RightsService) {}

  @Post()
  create(@Body() createRightsDto: CreateRightsDto) {
    return this.rightsService.create(createRightsDto);
  }

  @Get()
  findAll(
    @Query('ownerId') ownerId?: string,
    @Query('trackId') trackId?: string,
    @Query('albumId') albumId?: string,
    @Query('rightsType') rightsType?: string,
    @Query('status') status?: RightsStatus,
  ) {
    return this.rightsService.findAll({
      ownerId,
      trackId,
      albumId,
      rightsType,
      status,
    });
  }

  @Get('ownership')
  getRightsOwnership(
    @Query('trackId') trackId?: string,
    @Query('albumId') albumId?: string,
  ) {
    return this.rightsService.getRightsOwnership(trackId, albumId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRightsDto: Partial<CreateRightsDto>,
  ) {
    return this.rightsService.update(id, updateRightsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightsService.remove(id);
  }
}