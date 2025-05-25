import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { RightsHolderService } from '../services/rights-holder.service';
import { CreateRightsHolderDto } from '../dto/create-rights-holder.dto';
import { UpdateRightsHolderDto } from '../dto/update-rights-holder.dto';

@Controller('rights-holders')
export class RightsHolderController {
  constructor(private readonly holderService: RightsHolderService) {}

  @Post()
  create(@Body() dto: CreateRightsHolderDto) {
    return this.holderService.create(dto);
  }

  @Get()
  findAll() {
    return this.holderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRightsHolderDto) {
    return this.holderService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holderService.remove(id);
  }

  @Get(':id/is-verified')
  isVerified(@Param('id') id: string) {
    return this.holderService.isVerified(id);
  }

  @Get(':id/can-receive-royalties')
  canReceiveRoyalties(@Param('id') id: string) {
    return this.holderService.canReceiveRoyalties(id);
  }

  @Get(':id/active-licenses-count')
  getActiveLicensesCount(@Param('id') id: string) {
    return this.holderService.activeLicensesCount(id);
  }

  @Get(':id/has-valid-banking')
  hasValidBanking(@Param('id') id: string) {
    return this.holderService.hasValidBanking(id);
  }

  @Post(':id/verify')
  verifyHolder(
    @Param('id') id: string,
    @Query('verifiedBy') verifiedBy: string,
  ) {
    return this.holderService.verifyHolder(id, verifiedBy);
  }
}
