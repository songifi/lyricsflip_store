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
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMessageDto, UpdateMessageDto } from './communication.service';

@Controller('bands/:bandId/messages')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post()
  async sendMessage(
    @Param('bandId') bandId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ) {
    return this.communicationService.sendMessage(bandId, createMessageDto, req.user.id);
  }

  @Get()
  async getMessages(
    @Param('bandId') bandId: string,
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.communicationService.getMessages(
      bandId,
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('pinned')
  async getPinnedMessages(@Param('bandId') bandId: string, @Request() req) {
    return this.communicationService.getPinnedMessages(bandId, req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Param('bandId') bandId: string, @Request() req) {
    const count = await this.communicationService.getUnreadCount(bandId, req.user.id);
    return { count };
  }

  @Get('activity')
  async getBandActivity(
    @Param('bandId') bandId: string,
    @Request() req,
    @Query('days') days: string = '7',
  ) {
    return this.communicationService.getBandActivity(bandId, req.user.id, parseInt(days));
  }

  @Post('announcements')
  async sendAnnouncement(
    @Param('bandId') bandId: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.communicationService.sendAnnouncement(bandId, content, req.user.id);
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req,
  ) {
    return this.communicationService.updateMessage(messageId, updateMessageDto, req.user.id);
  }

  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: string, @Request() req) {
    await this.communicationService.deleteMessage(messageId, req.user.id);
    return { message: 'Message deleted successfully' };
  }

  @Post(':messageId/read')
  async markAsRead(@Param('messageId') messageId: string, @Request() req) {
    await this.communicationService.markMessageAsRead(messageId, req.user.id);
    return { message: 'Message marked as read' };
  }
}