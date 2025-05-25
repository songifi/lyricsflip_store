import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AutocompleteStrategy {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async suggest(query: string) {
    const result = await this.dataSource.query(`
      SELECT DISTINCT name
      FROM (
        SELECT name FROM music
        UNION
        SELECT name FROM artist
        UNION
        SELECT title as name FROM merchandise
        UNION
        SELECT title as name FROM event
      ) names
      WHERE LOWER(name) LIKE $1
      LIMIT 10
    `, [`${query.toLowerCase()}%`]);

    return result.map(row => row.name);
  }
}
