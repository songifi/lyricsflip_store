import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: SearchQueryDto) {
    return this.searchService.performSearch(query);
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') q: string) {
    return this.searchService.getSearchSuggestions(q);
  }

  @Get('trending')
  async getTrendingTerms() {
    return this.searchService.getTrendingSearches();
  }
}
