import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DirectMessagingService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // Send message from sender to receiver
  async sendMessage(sender: User, createMessageDto: CreateMessageDto): Promise<Message> {
    const { receiverId, content } = createMessageDto;

    if (sender.id === receiverId) {
      throw new ForbiddenException("Cannot send message to yourself");
    }

    // Ideally you fetch receiver user entity from DB via UserRepository (injected)
    // For example purpose, assume you get receiver from userService (not shown)
    const receiver = await this.findUserById(receiverId);
    if (!receiver) throw new NotFoundException('Receiver user not found');

    const message = this.messageRepository.create({
      sender,
      receiver,
      content,
      read: false,
    });

    return await this.messageRepository.save(message);
  }

  // Get all messages between current user and another user (conversation)
  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  // Mark message as read by messageId and user
  async markAsRead(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['receiver'],
    });
    if (!message) throw new NotFoundException('Message not found');

    if (message.receiver.id !== userId) {
      throw new ForbiddenException('You cannot mark this message as read');
    }

    if (!message.read) {
      message.read = true;
      await this.messageRepository.save(message);
    }

    return message;
  }

  // Helper: find user by id (you'd normally delegate this to user service)
  private async findUserById(userId: string): Promise<User | null> {
    // Implementation omitted: inject UserRepository or UserService and find user
    // For now, throw error to indicate needed
    throw new NotFoundException('User service integration needed');
  }
}
