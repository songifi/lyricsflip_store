export interface PlaybackMetrics {
  trackId: string;
  userId: string;
  playCount: number;
  totalDuration: number;
  completionRate: number;
  skipRate: number;
  averageListenTime: number;
}
