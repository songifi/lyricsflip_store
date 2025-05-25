export interface CrossfadeSettings {
  enabled: boolean;
  duration: number; // in seconds
  curve: 'linear' | 'exponential' | 'logarithmic';
}
