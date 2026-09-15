import { assessPap, CoverageStatus, PapAssessment } from '../rules/pap';
import type { DataSource } from './client';
import type { CodeableConcept, Condition, Coverage, Encounter, HumanName, MedicationRequest, Observation, Patient } from './types';

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
  deceased: boolean;
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
    // Age stops at the date of death; a record should never report a deceased patient aging on.
    age: ageFrom(p.birthDate, p.deceasedDateTime ? new Date(p.deceasedDateTime) : undefined),
    sex: SEX_LABELS[p.gender ?? 'unknown'] ?? 'Unknown',
    mrn,
    mrnShort: mrn && mrn.length > 14 ? `${mrn.slice(0, 8).toUpperCase()}...` : mrn,
    phone: p.telecom?.find((t) => t.system === 'phone')?.value ?? null,
    language: language ? conceptText(language, '') || null : null,
    deceased: !!p.deceasedDateTime || p.deceasedBoolean === true,
  };
}

// ---- Condition ------------------------------------------------------------------------------

export interface ConditionVM {
  id: string;
  display: string;
  clinicalStatus: string;
  active: boolean;
  onset: string | null;
}

const titleCase = (s: string) => s.replace(/(^|[-\s])(\w)/g, (_, sep: string, c: string) => `${sep === '-' ? ' ' : sep}${c.toUpperCase()}`);

export function toConditionVM(c: Condition): ConditionVM {
  const statusCode = c.clinicalStatus?.coding?.[0]?.code ?? c.clinicalStatus?.text ?? 'unknown';
  return {
    id: c.id ?? '',
    display: conceptText(c.code, 'Unnamed condition'),
    clinicalStatus: titleCase(statusCode),
    active: ['active', 'recurrence', 'relapse'].includes(statusCode),
    onset: formatDate(c.onsetDateTime ?? c.onsetPeriod?.start ?? c.recordedDate),
  };
}

/** Active problems first, then most recent onset, the order a clinician scans a problem list. */
export function sortConditions(rows: { vm: ConditionVM; raw: Condition }[]): ConditionVM[] {
  const onsetOf = (c: Condition) => c.onsetDateTime ?? c.onsetPeriod?.start ?? c.recordedDate ?? '';
  return rows
    .sort((a, b) => Number(b.vm.active) - Number(a.vm.active) || onsetOf(b.raw).localeCompare(onsetOf(a.raw)))
    .map((r) => r.vm);
}

// ---- MedicationRequest ----------------------------------------------------------------------

export interface MedicationVM {
  key: string;
  id: string;
  display: string;
  status: string;
  active: boolean;
  authored: string | null;
  authoredIso: string | null;
  pap: PapAssessment;
}

export function toMedicationVM(m: MedicationRequest, coverage: CoverageStatus, patientKey: string): MedicationVM {
  const display = m.medicationCodeableConcept
    ? conceptText(m.medicationCodeableConcept, 'Unnamed medication')
    : m.medicationReference?.display ?? 'Medication (details on a separate resource)';
  return {
    key: `${patientKey}:${m.id}`,
    id: m.id ?? '',
    display,
    status: titleCase(m.status ?? 'unknown'),
    active: m.status === 'active',
    authored: formatDate(m.authoredOn),
    authoredIso: m.authoredOn ?? null,
    pap: assessPap(display, m.status, coverage),
  };
}

export function coverageStatusFrom(result: { entries: Coverage[] } | Error): CoverageStatus {
  if (result instanceof Error) return 'unknown';
  return result.entries.some((c) => !c.status || c.status === 'active') ? 'covered' : 'none';
}

// ---- Observation (vital signs) --------------------------------------------------------------

export type VitalKind = 'bp' | 'hr' | 'temp' | 'weight' | 'bmi' | 'spo2';

// LOINC codes seen across Synthea, SMART, and HAPI data for the same measurement.
const VITAL_CODES: Record<VitalKind, string[]> = {
  bp: ['85354-9', '55284-4'],
  hr: ['8867-4'],
  temp: ['8310-5', '8331-1'],
  weight: ['29463-7', '3141-9'],
  bmi: ['39156-5'],
  spo2: ['59408-5', '2708-6'],
};

export const VITAL_LABELS: Record<VitalKind, string> = {
  bp: 'Blood pressure',
  hr: 'Heart rate',
  temp: 'Temperature',
  weight: 'Weight',
  bmi: 'BMI',
  spo2: 'SpO2',
};

export const VITAL_ORDER: VitalKind[] = ['bp', 'hr', 'temp', 'weight', 'bmi', 'spo2'];

export interface VitalPoint {
  at: string;
  value: number;
  /** Diastolic, for blood pressure only. */
  value2?: number;
}

export interface VitalVM {
  kind: VitalKind;
  label: string;
  latest: string | null;
  secondary: string | null;
  unit: string;
  takenOn: string | null;
  /** Oldest first. */
  series: VitalPoint[];
  trend: 'up' | 'down' | 'flat' | null;
}

const SYSTOLIC = '8480-6';
const DIASTOLIC = '8462-4';

function kindOf(o: Observation): VitalKind | null {
  const codes = (o.code.coding ?? []).map((c) => c.code);
  const found = VITAL_ORDER.find((k) => VITAL_CODES[k].some((code) => codes.includes(code)));
  if (found) return found;
  // Some servers send systolic and diastolic as standalone observations instead of components.
  if (codes.includes(SYSTOLIC)) return 'bp';
  return null;
}

function pointOf(kind: VitalKind, o: Observation): VitalPoint | null {
  const at = o.effectiveDateTime ?? o.effectivePeriod?.start ?? o.issued;
  if (!at) return null;
  if (kind === 'bp') {
    const comp = (code: string) => o.component?.find((c) => c.code.coding?.some((cd) => cd.code === code))?.valueQuantity?.value;
    const systolic = comp(SYSTOLIC) ?? (o.code.coding?.some((c) => c.code === SYSTOLIC) ? o.valueQuantity?.value : undefined);
    if (systolic === undefined) return null;
    return { at, value: systolic, value2: comp(DIASTOLIC) };
  }
  const value = o.valueQuantity?.value;
  return value === undefined ? null : { at, value };
}

const round = (v: number, digits: number) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

function describe(kind: VitalKind, p: VitalPoint, unit?: string): { latest: string; secondary: string | null; unit: string } {
  switch (kind) {
    case 'bp':
      return { latest: `${Math.round(p.value)}/${p.value2 !== undefined ? Math.round(p.value2) : '--'}`, secondary: null, unit: 'mmHg' };
    case 'hr':
      return { latest: String(Math.round(p.value)), secondary: null, unit: 'bpm' };
    case 'temp': {
      const isF = unit === '[degF]' || unit === 'degF';
      const c = isF ? ((p.value - 32) * 5) / 9 : p.value;
      return { latest: round(c, 1).toFixed(1), secondary: `${round((c * 9) / 5 + 32, 1).toFixed(1)} °F`, unit: '°C' };
    }
    case 'weight': {
      const isLb = unit === '[lb_av]' || unit === 'lb';
      const kg = isLb ? p.value * 0.45359237 : p.value;
      return { latest: round(kg, 1).toFixed(1), secondary: `${round(kg / 0.45359237, 1).toFixed(1)} lb`, unit: 'kg' };
    }
    case 'bmi':
      return { latest: round(p.value, 1).toFixed(1), secondary: null, unit: 'kg/m2' };
    case 'spo2':
      return { latest: String(Math.round(p.value)), secondary: null, unit: '%' };
  }
}

/**
 * Collapses a vital-signs search into the latest value per measurement, with a short history for
 * trend display. A trend is only shown with three or more readings; two points are not a trend.
 */
export function toVitalVMs(observations: Observation[]): VitalVM[] {
  const buckets = new Map<VitalKind, { points: VitalPoint[]; unit?: string }>();
  for (const o of observations) {
    if (o.status === 'entered-in-error' || o.status === 'cancelled') continue;
    const kind = kindOf(o);
    if (!kind) continue;
    const point = pointOf(kind, o);
    if (!point) continue;
    const bucket = buckets.get(kind) ?? { points: [], unit: undefined };
    bucket.points.push(point);
    bucket.unit = bucket.unit ?? o.valueQuantity?.code ?? o.valueQuantity?.unit;
    buckets.set(kind, bucket);
  }

  return VITAL_ORDER.map((kind) => {
    const bucket = buckets.get(kind);
    const series = (bucket?.points ?? []).sort((a, b) => a.at.localeCompare(b.at));
    const last = series[series.length - 1];
    if (!last) {
      return { kind, label: VITAL_LABELS[kind], latest: null, secondary: null, unit: '', takenOn: null, series: [], trend: null };
    }
    const d = describe(kind, last, bucket?.unit);
    let trend: VitalVM['trend'] = null;
    if (series.length >= 3) {
      // Direction across the whole window, so the arrow agrees with the sparkline beside it.
      const first = series[0].value;
      const delta = last.value - first;
      trend = Math.abs(delta) < Math.max(0.5, Math.abs(first) * 0.02) ? 'flat' : delta > 0 ? 'up' : 'down';
    }
    return { kind, label: VITAL_LABELS[kind], ...d, takenOn: formatDate(last.at), series, trend };
  });
}

// ---- Encounter ------------------------------------------------------------------------------

export interface EncounterVM {
  id: string;
  classLabel: string;
  type: string;
  when: string;
  reason: string | null;
  status: string;
}

const ENCOUNTER_CLASSES: Record<string, string> = {
  AMB: 'Outpatient',
  EMER: 'Emergency',
  IMP: 'Inpatient',
  ACUTE: 'Inpatient acute',
  NONAC: 'Inpatient non-acute',
  OBSENC: 'Observation',
  HH: 'Home health',
  VR: 'Virtual',
  FLD: 'Field',
};

function formatPeriod(start?: string, end?: string): string {
  const s = formatDate(start);
  if (!s) return 'Date not recorded';
  const e = formatDate(end);
  return e && e !== s ? `${s} to ${e}` : s;
}

export function toEncounterVM(e: Encounter): EncounterVM {
  const code = e.class?.code ?? '';
  return {
    id: e.id ?? '',
    classLabel: ENCOUNTER_CLASSES[code] ?? (e.class?.display ? titleCase(e.class.display) : 'Encounter'),
    type: e.type?.length ? conceptText(e.type[0]) : 'Visit',
    when: formatPeriod(e.period?.start, e.period?.end),
    reason: e.reasonCode?.length ? e.reasonCode.map((r) => conceptText(r)).join(', ') : null,
    status: titleCase(e.status ?? 'unknown'),
  };
}
