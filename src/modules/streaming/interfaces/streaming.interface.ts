import { AudioQuality, StreamingStatus, DownloadStatus } from '../enums/audio-quality.enum';

export interface StreamingSession {
  id: string;
  userId: string;
  trackId: string;
  quality: AudioQuality;
  status: StreamingStatus;
  startTime: Date;
  endTime?: Date;
  duration: number;
  bytesStreamed: number;
  ipAddress: string;
  userAgent: string;
  location?: string;
}
