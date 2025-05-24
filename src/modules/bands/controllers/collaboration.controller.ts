import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CollaborationStatus } from '../../database/entities/collaboration.entity';

@Controller('bands/:bandId/collaborations')
@UseGuards(JwtAuthGuard)
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Post()
  async create(
    @Param('bandId') bandId: string,
    @Body() createCollaborationDto: CreateCollaborationDto,
    @Request() req,
  ) {
    return this.collaborationsService.createCollaboration(
      bandId,
      createCollaborationDto,
      req.user.id,
    );
  }

  @Get()
  async findByBand(@Param('bandId') bandId: string) {
    return this.collaborationsService.findByBand(bandId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.collaborationsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CollaborationStatus,
    @Request() req,
  ) {
    return this.collaborationsService.updateCollaborationStatus(id, status, req.user.id);
  }

  @Post('invites/:inviteId/respond')
  async respondToInvite(
    @Param('inviteId') inviteId: string,
    @Body('response') response: 'accept' | 'decline',
    @Request() req,
  ) {
    await this.collaborationsService.respondToInvite(inviteId, response, req.user.id);
    return { message: `Invite ${response}ed successfully` };
  }

  @Get('invites/user')
  async getUserInvites(@Request() req) {
    return this.collaborationsService.getUserInvites(req.user.id);
  }

  @Get('invites/band/:bandId')
  async getBandInvites(@Param('bandId') bandId: string) {
    return this.collaborationsService.getBandInvites(bandId);
  }
}