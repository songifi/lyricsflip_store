import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessagingService } from './direct-messaging.service';
import { DirectMessagingController } from './direct-messaging.controller';
import { Message } from './entities/message.entity';
import { UsersModule } from '../users/users.module'; // Needed for UserService or UserRepository injection

@Module({
  imports: [TypeOrmModule.forFeature([Message]), forwardRef(() => UsersModule)],
  providers: [DirectMessagingService],
  controllers: [DirectMessagingController],
  exports: [DirectMessagingService],
})
export class DirectMessagingModule {}
