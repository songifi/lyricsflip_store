@Injectable()
export class DuplicateService {
  detectDuplicates(catalogs: Catalog[]): DuplicateResult[] {
    const results: DuplicateResult[] = [];
    const seen = new Set<string>();

    catalogs.forEach((a, i) => {
      catalogs.slice(i + 1).forEach(b => {
        if (this.isDuplicate(a, b)) {
          results.push({ catalog1: a.id, catalog2: b.id });
        }
      });
    });

    return results;
  }

  private isDuplicate(a: Catalog, b: Catalog): boolean {
    return a.title === b.title &&
      a.artist === b.artist &&
      a.album === b.album;
  }
}
