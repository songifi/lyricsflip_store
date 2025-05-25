import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BandMessage, MessageType } from '../../database/entities/band-message.entity';
import { BandsService } from './bands.service';
import { MemberPermission, MemberStatus } from '../../database/entities/band-member.entity';

export interface CreateMessageDto {
  content: string;
  type?: MessageType;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
}

export interface UpdateMessageDto {
  content?: string;
  isPinned?: boolean;
}

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(BandMessage)
    private messageRepository: Repository<BandMessage>,
    private bandsService: BandsService,
  ) {}

  async sendMessage(
    bandId: string,
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<BandMessage> {
    // Check if user is a member of the band
    const permission = await this.bandsService.checkMemberPermission(bandId, senderId);
    if (!permission) {
      throw new ForbiddenException('You are not a member of this band');
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      bandId,
      senderId,
      type: createMessageDto.type || MessageType.TEXT,
    });

    return this.messageRepository.save(message);
  }

  async getMessages(
    bandId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    messages: BandMessage[];
    total: number;
    hasMore: boolean;
  }> {
    // Check if user is a member of the band
    const permission = await this.bandsService.checkMemberPermission(bandId, userId);
    if (!permission) {
      throw new ForbiddenException('You are not a member of this band');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { bandId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      hasMore: total > page * limit,
    };
  }

  async getPinnedMessages(bandId: string, userId: string): Promise<BandMessage[]> {
    // Check if user is a member of the band
    const permission = await this.bandsService.checkMemberPermission(bandId, userId);
    if (!permission) {
      throw new ForbiddenException('You are not a member of this band');
    }

    return this.messageRepository.find({
      where: { bandId, isPinned: true },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateMessage(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
  ): Promise<BandMessage> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user can update the message
    if (message.senderId !== userId) {
      // Check if user has admin/manager permission for pinning
      if (updateMessageDto.isPinned !== undefined) {
        const permission = await this.bandsService.checkMemberPermission(message.bandId, userId);
        if (!permission || (permission !== MemberPermission.ADMIN && permission !== MemberPermission.MANAGER)) {
          throw new ForbiddenException('Only admins and managers can pin/unpin messages');
        }
      } else {
        throw new ForbiddenException('You can only edit your own messages');
      }
    }

    await this.messageRepository.update(messageId, updateMessageDto);

    return this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user can delete the message
    if (message.senderId !== userId) {
      const permission = await this.bandsService.checkMemberPermission(message.bandId, userId);
      if (!permission || permission !== MemberPermission.ADMIN) {
        throw new ForbiddenException('You can only delete your own messages or be an admin');
      }
    }

    await this.messageRepository.delete(messageId);
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is a member of the band
    const permission = await this.bandsService.checkMemberPermission(message.bandId, userId);
    if (!permission) {
      throw new ForbiddenException('You are not a member of this band');
    }

    const readBy = message.readBy || {};
    readBy[userId] = new Date();

    await this.messageRepository.update(messageId, { readBy });
  }

  async getUnreadCount(bandId: string, userId: string): Promise<number> {
    // Check if user is a member of the band
    const permission = await this.bandsService.checkMemberPermission(bandId, userId);
    if (!permission) {
      return 0;
    }

    const count = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.bandId = :bandId', { bandId })
      .andWhere('(message.readBy IS NULL OR message.readBy ->> :userId IS NULL)', { userId })
      .andWhere('message.senderId != :userId', { userId })
      .getCount();

    return count;
  }

  async sendAnnouncement(
    bandId: string,
    content: string,
    senderId: string,
  ): Promise<BandMessage> {
    // Check if user has permission to send announcements
    const permission = await this.bandsService.checkMemberPermission(bandId, senderId);
    if (!permission || (permission !== MemberPermission.ADMIN && permission !== MemberPermission.MANAGER)) {
      throw new ForbiddenException('Only admins and managers can send announcements');
    }

    const announcement = this.messageRepository.create({
      bandId,
      senderId,
      content,
      type: MessageType.ANNOUNCEMENT,
      isPinned: true,
    });

    return this.messageRepository.save(announcement);
  }

  async getBandActivity(bandId: string, userId: string, days: number = 7): Promise<{
    messageCount: number;
    activeMembers: number;
    recentMessages: BandMessage[];
  }> {
    // Check if user is a member of the band
    const permission = await this.bandsService.checkMemberPermission(bandId, userId);
    if (!permission) {
      throw new ForbiddenException('You are not a member of this band');
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const messageCount = await this.messageRepository.count({
      where: {
        bandId,
        createdAt: { $gte: since } as any,
      },
    });

    const recentMessages = await this.messageRepository.find({
      where: {
        bandId,
        createdAt: { $gte: since } as any,
      },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const activeMembers = new Set(recentMessages.map(m => m.senderId)).size;

    return {
      messageCount,
      activeMembers,
      recentMessages,
    };
  }
}