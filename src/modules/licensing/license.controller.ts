// src/licensing/controllers/license.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LicenseService } from '../services/license.service';
import { CreateLicenseDto, UpdateLicenseDto } from '../dtos/license.dto';

@Controller('licenses')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  create(@Body() data: CreateLicenseDto) {
    return this.licenseService.create(data);
  }

  @Get()
  findAll() {
    return this.licenseService.findAll();
  }

  @Get('active')
  getActiveLicenses() {
    return this.licenseService.getActiveLicenses();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.licenseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateLicenseDto,
  ) {
    return this.licenseService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.licenseService.delete(id);
  }

  @Get(':id/royalty')
  calculateRoyalty(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('grossRevenue') grossRevenue: number,
  ) {
    return this.licenseService.calculateRoyalty(id, grossRevenue);
  }

  @Get(':id/territory')
  verifyTerritory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('territory') territory: string,
  ) {
    return this.licenseService.verifyTerritory(id, territory);
  }

  @Get(':id/is-expired')
  checkIsExpired(@Param('id', ParseUUIDPipe) id: string) {
    return this.licenseService.isExpired(id);
  }
}
