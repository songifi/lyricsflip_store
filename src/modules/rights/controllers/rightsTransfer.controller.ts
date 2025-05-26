import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RightsTransferService } from '../services/rights-transfer.service';
import { CreateRightsTransferDto } from '../dto/create-rights-transfer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TransferStatus } from '../entities/rights-transfer.entity';

@Controller('rights-transfers')
@UseGuards(JwtAuthGuard)
export class RightsTransferController {
  constructor(private readonly rightsTransferService: RightsTransferService) {}

  @Post()
  create(@Body() createTransferDto: CreateRightsTransferDto) {
    return this.rightsTransferService.create(createTransferDto);
  }

  @Get()
  findAll(
    @Query('rightsId') rightsId?: string,
    @Query('transferorId') transferorId?: string,
    @Query('transfereeId') transfereeId?: string,
    @Query('status') status?: TransferStatus,
  ) {
    return this.rightsTransferService.findAll({
      rightsId,
      transferorId,
      transfereeId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightsTransferService.findOne(id);
  }

  @Patch(':id/execute')
  execute(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightsTransferService.execute(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightsTransferService.cancel(id);
  }
}