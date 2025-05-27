export function calculateMechanicalRoyalty(revenue: number, splitPercentage: number): number {
  return (revenue * (splitPercentage / 100));
}
