// Patient assistance program (PAP) eligibility heuristic.
//
// Manufacturers give brand-name medications free to uninsured, low-income patients, and free
// clinics apply on the patient's behalf. Real eligibility depends on household income (commonly
// a ceiling between 200% and 500% of the Federal Poverty Level), US residency, and the absence
// of prescription coverage, and each program sets its own rules. This rule only flags
// candidates for a pharmacy volunteer to review: a brand on the list below, and no Coverage
// resource on file. In a sandbox, a missing Coverage resource does not prove a patient is
// uninsured, which is exactly why the output is a worklist rather than a decision.

export interface PapDrug {
  brand: string;
  manufacturer: string;
  /** Rough retail price for one month's supply or one device, in USD. Illustrative, not pricing data. */
  estimatedRetailUsd: number;
}

// Illustrative list of brands commonly available through manufacturer PAPs. Not exhaustive,
// not current formulary guidance, and prices are round estimates for demonstration only.
export const PAP_DRUGS: PapDrug[] = [
  { brand: 'Eliquis', manufacturer: 'Bristol Myers Squibb', estimatedRetailUsd: 620 },
  { brand: 'Xarelto', manufacturer: 'Janssen', estimatedRetailUsd: 590 },
  { brand: 'Brilinta', manufacturer: 'AstraZeneca', estimatedRetailUsd: 460 },
  { brand: 'Entresto', manufacturer: 'Novartis', estimatedRetailUsd: 700 },
  { brand: 'Jardiance', manufacturer: 'Boehringer Ingelheim', estimatedRetailUsd: 640 },
  { brand: 'Farxiga', manufacturer: 'AstraZeneca', estimatedRetailUsd: 620 },
  { brand: 'Januvia', manufacturer: 'Merck', estimatedRetailUsd: 560 },
  { brand: 'Lantus', manufacturer: 'Sanofi', estimatedRetailUsd: 110 },
  { brand: 'Humalog', manufacturer: 'Eli Lilly', estimatedRetailUsd: 160 },
  { brand: 'Symbicort', manufacturer: 'AstraZeneca', estimatedRetailUsd: 330 },
  { brand: 'Trelegy', manufacturer: 'GSK', estimatedRetailUsd: 720 },
  { brand: 'Mirena', manufacturer: 'Bayer', estimatedRetailUsd: 1100 },
  { brand: 'Kyleena', manufacturer: 'Bayer', estimatedRetailUsd: 1100 },
  { brand: 'NuvaRing', manufacturer: 'Organon', estimatedRetailUsd: 210 },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MATCHERS = PAP_DRUGS.map((drug) => ({ drug, re: new RegExp(`\\b${escape(drug.brand)}\\b`, 'i') }));

export function matchPapDrug(medicationDisplay: string): PapDrug | null {
  return MATCHERS.find((m) => m.re.test(medicationDisplay))?.drug ?? null;
}

/** 'unknown' when the Coverage search failed; the rule never guesses in the patient's favor or against it. */
export type CoverageStatus = 'none' | 'covered' | 'unknown';

export type PapAssessment =
  | { status: 'eligible'; drug: PapDrug }
  | { status: 'needsCoverageCheck'; drug: PapDrug }
  | { status: 'hasCoverage'; drug: PapDrug }
  | { status: 'notListed' };

// Only medications that are still being taken are worth an application.
const ACTIVE_STATUSES = new Set(['active', 'on-hold', 'draft']);

export function assessPap(medicationDisplay: string, medicationStatus: string | undefined, coverage: CoverageStatus): PapAssessment {
  const drug = matchPapDrug(medicationDisplay);
  if (!drug || (medicationStatus && !ACTIVE_STATUSES.has(medicationStatus))) return { status: 'notListed' };
  if (coverage === 'covered') return { status: 'hasCoverage', drug };
  if (coverage === 'unknown') return { status: 'needsCoverageCheck', drug };
  return { status: 'eligible', drug };
}

export function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}
