import { Controller, Post, Get, Param, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { DirectMessagingService } from './direct-messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class DirectMessagingController {
  constructor(private readonly directMessagingService: DirectMessagingService) {}

  // Send message to a user
  @Post()
  async sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    const sender = req.user; // extracted from JWT payload
    return this.directMessagingService.sendMessage(sender, createMessageDto);
  }

  // Get conversation between current user and another user
  @Get('conversation/:otherUserId')
  async getConversation(@Request() req, @Param('otherUserId') otherUserId: string) {
    const userId = req.user.id;
    return this.directMessagingService.getConversation(userId, otherUserId);
  }

  // Mark message as read
  @Patch('read/:messageId')
  async markAsRead(@Request() req, @Param('messageId') messageId: string) {
    const userId = req.user.id;
    return this.directMessagingService.markAsRead(userId, messageId);
  }
}
