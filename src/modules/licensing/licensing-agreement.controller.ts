import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { LicensingAgreementService } from '../services/licensing-agreement.service';
import { CreateLicensingAgreementDto } from '../dto/create-licensing-agreement.dto';
import { UpdateLicensingAgreementDto } from '../dto/update-licensing-agreement.dto';

@Controller('licensing-agreements')
export class LicensingAgreementController {
  constructor(private readonly agreementService: LicensingAgreementService) {}

  @Post()
  create(@Body() dto: CreateLicensingAgreementDto) {
    return this.agreementService.create(dto);
  }

  @Get()
  findAll() {
    return this.agreementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agreementService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLicensingAgreementDto) {
    return this.agreementService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agreementService.remove(id);
  }

  @Get(':id/calculate-royalty')
  calculateRoyalty(
    @Param('id') id: string,
    @Query('grossRevenue') grossRevenue: number,
  ) {
    return this.agreementService.calculateRoyalty(id, Number(grossRevenue));
  }

  @Get(':id/renewal-check')
  needsRenewal(
    @Param('id') id: string,
    @Query('daysInAdvance') daysInAdvance?: number,
  ) {
    return this.agreementService.checkRenewalNeeded(id, daysInAdvance ?? 90);
  }

  @Get(':id/is-fully-signed')
  isFullySigned(@Param('id') id: string) {
    return this.agreementService.isFullySigned(id);
  }

  @Get(':id/can-terminate')
  canTerminate(@Param('id') id: string) {
    return this.agreementService.canBeTerminated(id);
  }
}
