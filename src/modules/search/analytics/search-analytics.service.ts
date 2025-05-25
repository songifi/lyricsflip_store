import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchEvent } from '../entities/search-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SearchAnalyticsService {
  constructor(
    @InjectRepository(SearchEvent)
    private searchRepo: Repository<SearchEvent>,
  ) {}

  async trackSearch(query: string) {
    const event = this.searchRepo.create({ term: query });
    return this.searchRepo.save(event);
  }
}
