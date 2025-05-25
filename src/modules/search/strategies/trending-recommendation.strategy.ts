import { Injectable } from '@nestjs/common';

@Injectable()
export class TrendingRecommendationStrategy {
  async getTrendingTerms() {
    // Stub: Replace with real analytics tracking or cache
    return ['Afrobeats', 'Live Concert', 'Limited Merch'];
  }
}
