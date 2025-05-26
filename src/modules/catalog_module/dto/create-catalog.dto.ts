export class CreateCatalogDto {
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: Date;
  metadata?: Record<string, any>;
}
