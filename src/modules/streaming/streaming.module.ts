import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamingSession } from '../../database/entities/streaming-session.entity';
import { StreamingAnalytics } from '../../database/entities/streaming-analytics.entity';
import { DownloadSession } from '../../database/entities/download-session.entity';
import { StreamingHistory } from '../../database/entities/streaming-history.entity';
import { StreamingController } from './controllers/streaming.controller';
import { StreamingSessionService } from './services/streaming-session.service';
import { DownloadService } from './services/download.service';
import { StreamingHistoryService } from './services/streaming-history.service';
import { PlaybackService } from './services/playback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StreamingSession,
      StreamingAnalytics,
      DownloadSession,
      StreamingHistory,
    ]),
  ],
  controllers: [StreamingController],
  providers: [
    StreamingSessionService,
    DownloadService,
    StreamingHistoryService,
    PlaybackService,
  ],
  exports: [
    StreamingSessionService,
    DownloadService,
    StreamingHistoryService,
    PlaybackService,
  ],
})
export class StreamingModule {}
