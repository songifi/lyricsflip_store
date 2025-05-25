export interface BandwidthOptimization {
  userId: string;
  connectionSpeed: number;
  recommendedQuality: AudioQuality;
  adaptiveStreaming: boolean;
}
