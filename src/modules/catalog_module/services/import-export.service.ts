@Injectable()
export class ImportExportService {
  async importCSV(fileBuffer: Buffer): Promise<Catalog[]> {
    const csv = await parse(fileBuffer);
    return csv.map(row => ({
      title: row.title,
      artist: row.artist,
      album: row.album,
      genre: row.genre,
      releaseDate: new Date(row.releaseDate),
      metadata: { source: 'csv' },
    }));
  }

  async exportToJSON(catalogs: Catalog[]): Promise<string> {
    return JSON.stringify(catalogs, null, 2);
  }
}
