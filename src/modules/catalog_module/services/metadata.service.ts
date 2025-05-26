import { Injectable } from '@nestjs/common';

@Injectable()
export class MetadataService {
  normalizeMetadata(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist: this.normalizeName(data.artist),
      genre: this.normalizeGenre(data.genre),
    };
  }

  private normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  private normalizeGenre(genre: string): string {
    const genreMap = {
      hiphop: 'Hip-Hop',
      'hip hop': 'Hip-Hop',
      edm: 'Electronic',
    };
    return genreMap[genre.toLowerCase()] || genre;
  }
}
