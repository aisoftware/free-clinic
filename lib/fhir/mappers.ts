import type { DataSource } from './client';
import type { CodeableConcept, HumanName, Patient } from './types';

// ---- Shared helpers -------------------------------------------------------------------------

export function conceptText(concept?: CodeableConcept, fallback = 'Not specified'): string {
  return concept?.text?.trim() || concept?.coding?.find((c) => c.display)?.display || concept?.coding?.[0]?.code || fallback;
}

export function formatDate(iso?: string): string | null {
  if (!iso) return null;
  // Date-only values (YYYY-MM-DD) have no time zone; parse as local so they do not shift a day.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = dateOnly ? new Date(`${iso}T00:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ageFrom(birthDate?: string, now = new Date()): number | null {
  if (!birthDate) return null;
  const [y, m = 1, d = 1] = birthDate.split('-').map(Number);
  if (!y) return null;
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age >= 0 ? age : null;
}

// ---- Patient --------------------------------------------------------------------------------

export interface PatientVM {
  key: string;
  id: string;
  source: DataSource;
  name: string;
  givenFirst: string;
  birthDate: string | null;
  birthDateLabel: string | null;
  age: number | null;
  sex: string;
  mrn: string | null;
  /** List-row form. Sandbox MRNs are UUIDs; the full value stays on the detail screen. */
  mrnShort: string | null;
  phone: string | null;
  language: string | null;
}

function pickName(names?: HumanName[]): HumanName | undefined {
  return names?.find((n) => n.use === 'official') ?? names?.find((n) => n.use !== 'old') ?? names?.[0];
}

// Synthea-generated names carry numeric suffixes (for example "Barney639"); strip them for display.
function clean(part?: string) {
  return (part ?? '').replace(/\d+/g, '').trim();
}

const SEX_LABELS: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other', unknown: 'Unknown' };

export function toPatientVM(p: Patient, source: DataSource): PatientVM {
  const name = pickName(p.name);
  const given = (name?.given ?? []).map(clean).filter(Boolean).join(' ');
  const family = clean(name?.family);
  const text = clean(name?.text);
  const display = family ? `${family}, ${given}`.replace(/,\s*$/, '') : text || given || 'Unnamed patient';

  // Minimum necessary: only the clinic MRN is surfaced. SSN, driver license, and passport
  // identifiers present in the source record are deliberately never mapped into the view.
  const mrn = p.identifier?.find((i) => i.type?.coding?.some((c) => c.code === 'MR'))?.value ?? null;

  const language = p.communication?.find((c) => c.preferred)?.language ?? p.communication?.[0]?.language;

  return {
    key: `${source}:${p.id}`,
    id: p.id ?? '',
    source,
    name: display,
    givenFirst: [given, family].filter(Boolean).join(' ') || display,
    birthDate: p.birthDate ?? null,
    birthDateLabel: formatDate(p.birthDate),
    age: ageFrom(p.birthDate),
    sex: SEX_LABELS[p.gender ?? 'unknown'] ?? 'Unknown',
    mrn,
    mrnShort: mrn && mrn.length > 14 ? `${mrn.slice(0, 8).toUpperCase()}...` : mrn,
    phone: p.telecom?.find((t) => t.system === 'phone')?.value ?? null,
    language: language ? conceptText(language, '') || null : null,
  };
}
