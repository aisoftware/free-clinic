// Federal Poverty Level (FPL) and sliding-fee tier.
//
// Free and charitable clinics typically serve uninsured adults under a household income ceiling
// expressed as a percentage of FPL, and many charge a small sliding fee by tier. The table is a
// bundled constant rather than a runtime fetch: HHS publishes it once a year, and a clinic's
// eligibility policy is pinned to a specific year's figures until its board adopts the next.

/**
 * 2026 HHS poverty guidelines, 48 contiguous states and the District of Columbia.
 * Source: aspe.hhs.gov poverty guidelines, published January 2026.
 * Alaska and Hawaii use higher figures and are not modeled here.
 */
export const FPL_2026 = {
  year: 2026,
  firstPerson: 15_960,
  eachAdditionalPerson: 5_680,
} as const;

export function povertyGuideline(householdSize: number): number {
  const size = Math.max(1, Math.floor(householdSize));
  return FPL_2026.firstPerson + (size - 1) * FPL_2026.eachAdditionalPerson;
}

/** Household income as a percentage of the poverty guideline, rounded to a whole percent. */
export function fplPercent(monthlyIncome: number, householdSize: number): number {
  const annual = Math.max(0, monthlyIncome) * 12;
  return Math.round((annual / povertyGuideline(householdSize)) * 100);
}

export type FeeTierId = 'A' | 'B' | 'C' | 'D' | 'ineligible';

export interface FeeTier {
  id: FeeTierId;
  maxPercent: number | null;
  visitFeeUsd: number | null;
}

// Illustrative sliding-fee schedule. Each clinic's board sets its own tiers and ceiling; 200% FPL
// is a common eligibility limit for free clinics, above which patients are referred elsewhere
// (for example to a federally qualified health center with its own sliding scale).
export const FEE_TIERS: FeeTier[] = [
  { id: 'A', maxPercent: 100, visitFeeUsd: 0 },
  { id: 'B', maxPercent: 138, visitFeeUsd: 5 },
  { id: 'C', maxPercent: 175, visitFeeUsd: 10 },
  { id: 'D', maxPercent: 200, visitFeeUsd: 20 },
  { id: 'ineligible', maxPercent: null, visitFeeUsd: null },
];

export function feeTierFor(percent: number): FeeTier {
  return FEE_TIERS.find((t) => t.maxPercent !== null && percent <= t.maxPercent) ?? FEE_TIERS[FEE_TIERS.length - 1];
}
