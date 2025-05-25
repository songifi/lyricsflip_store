import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from '../dto/search-query.dto';

@Injectable()
export class FacetedNavigationStrategy {
  async buildFacets(query: SearchQueryDto) {
    return {
      genres: ['Pop', 'Hip Hop', 'Jazz', 'Rock'],
      years: [2023, 2022, 2021],
      locations: ['Lagos', 'Abuja', 'Kano'],
    };
  }
}
