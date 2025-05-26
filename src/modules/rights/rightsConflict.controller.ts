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
import { RightsConflictService } from '../services/rights-conflict.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ConflictType, ConflictStatus, ConflictSeverity } from '../entities/rights-conflict.entity';

@Controller('rights-conflicts')
@UseGuards(JwtAuthGuard)
export class RightsConflictController {
  constructor(private readonly rightsConflictService: RightsConflictService) {}

  @Post('detect/:rightsId')
  detectConflicts(@Param('rightsId', ParseUUIDPipe) rightsId: string) {
    return this.rightsConflictService.detectConflicts(rightsId);
  }

  @Get()
  findAll(
    @Query('rightsId') rightsId?: string,
    @Query('conflictType') conflictType?: ConflictType,
    @Query('status') status?: ConflictStatus,
    @Query('severity') severity?: ConflictSeverity,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.rightsConflictService.findAll({
      rightsId,
      conflictType,
      status,
      severity,
      assignedToId,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rightsConflictService.findOne(id);
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { resolution: string; resolvedById: string },
  ) {
    return this.rightsConflictService.resolve(id, body.resolution, body.resolvedById);
  }

  @Patch(':id/assign')
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { assignedToId: string },
  ) {
    return this.rightsConflictService.assign(id, body.assignedToId);
  }

  @Patch(':id/escalate')
  escalate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { escalatedById: string },
  ) {
    return this.rightsConflictService.escalate(id, body.escalatedById);
  }
}