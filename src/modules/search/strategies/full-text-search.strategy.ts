import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SearchQueryDto } from '../dto/search-query.dto';

@Injectable()
export class FullTextSearchStrategy {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async search(query: SearchQueryDto) {
    const { query: q, genre, year, priceMin, priceMax, location } = query;

    const results = await this.dataSource.query(`
      SELECT *, ts_rank_cd(to_tsvector('english', name || ' ' || description), plainto_tsquery($1)) AS rank
      FROM (
        SELECT id, name, description, 'music' as type FROM music
        UNION
        SELECT id, name, bio as description, 'artist' as type FROM artist
        UNION
        SELECT id, title as name, details as description, 'merchandise' as type FROM merchandise
        UNION
        SELECT id, title as name, description, 'event' as type FROM event
      ) combined
      WHERE to_tsvector('english', name || ' ' || description) @@ plainto_tsquery($1)
      ORDER BY rank DESC
    `, [q]);

    return results;
  }
}
