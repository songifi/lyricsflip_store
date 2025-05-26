export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
