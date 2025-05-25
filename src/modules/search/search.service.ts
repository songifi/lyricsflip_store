import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { FullTextSearchStrategy } from './strategies/full-text-search.strategy';
import { SimilaritySearchStrategy } from './strategies/similarity-search.strategy';
import { TrendingRecommendationStrategy } from './strategies/trending-recommendation.strategy';
import { AutocompleteStrategy } from './strategies/autocomplete.strategy';
import { FacetedNavigationStrategy } from './strategies/faceted-navigation.strategy';
import { SearchAnalyticsService } from './analytics/search-analytics.service';

@Injectable()
export class SearchService {
  constructor(
    private analyticsService: SearchAnalyticsService,
    private fullText: FullTextSearchStrategy,
    private similarity: SimilaritySearchStrategy,
    private trending: TrendingRecommendationStrategy,
    private auto: AutocompleteStrategy,
    private facet: FacetedNavigationStrategy,
  ) {}

  async performSearch(query: SearchQueryDto) {
    const results = await this.fullText.search(query);
    const similar = await this.similarity.findSimilar(query);
    const facets = await this.facet.buildFacets(query);
    await this.analyticsService.trackSearch(query.query);

    return {
      results,
      similar,
      facets,
    };
  }

  async getSearchSuggestions(query: string) {
    return this.auto.suggest(query);
  }

  async getTrendingSearches() {
    return this.trending.getTrendingTerms();
  }
}
