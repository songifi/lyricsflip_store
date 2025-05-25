import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';
import { CollaborationsController } from './collaborations.controller';
import { CollaborationsService } from './collaborations.service';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { Band } from '../../database/entities/band.entity';
import { BandMember } from '../../database/entities/band-member.entity';
import { BandRole } from '../../database/entities/band-role.entity';
import { Collaboration } from '../../database/entities/collaboration.entity';
import { CollaborationInvite } from '../../database/entities/collaboration-invite.entity';
import { RevenueShare } from '../../database/entities/revenue-share.entity';
import { BandMessage } from '../../database/entities/band-message.entity';
import { BandAlbum } from '../../database/entities/band-album.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Band,
      BandMember,
      BandRole,
      Collaboration,
      CollaborationInvite,
      RevenueShare,
      BandMessage,
      BandAlbum,
    ]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [
    BandsController,
    CollaborationsController,
    RevenueController,
    CommunicationController,
  ],
  providers: [
    BandsService,
    CollaborationsService,
    RevenueService,
    CommunicationService,
  ],
  exports: [BandsService, CollaborationsService, RevenueService],
})
export class BandsModule {}