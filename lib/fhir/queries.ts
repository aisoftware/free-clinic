import { search } from './client';
import {
  ConditionVM,
  coverageStatusFrom,
  EncounterVM,
  MedicationVM,
  PatientVM,
  sortConditions,
  toConditionVM,
  toEncounterVM,
  toMedicationVM,
  toVitalVMs,
  VitalVM,
} from './mappers';
import type { CoverageStatus, PapDrug } from '../rules/pap';

// Patient-scoped reads. Each one is pinned to the server the patient was loaded from and
// returns view models, so screens never touch raw FHIR. All reads are GET searches: this app
// never writes to a sandbox, because a shared public server is not a place to store even
// synthetic clinical changes, and a real deployment would write through an audited backend.

export async function getConditions(patient: PatientVM): Promise<ConditionVM[]> {
  const { entries } = await search('Condition', { patient: patient.id }, { source: patient.source });
  return sortConditions(entries.map((raw) => ({ raw, vm: toConditionVM(raw) })));
}

export async function getCoverageStatus(patient: PatientVM): Promise<CoverageStatus> {
  try {
    return coverageStatusFrom(await search('Coverage', { patient: patient.id }, { source: patient.source }));
  } catch (e) {
    return coverageStatusFrom(e instanceof Error ? e : new Error(String(e)));
  }
}

export interface MedicationsResult {
  medications: MedicationVM[];
  coverage: CoverageStatus;
}

export async function getMedications(patient: PatientVM): Promise<MedicationsResult> {
  const [meds, coverage] = await Promise.all([
    search('MedicationRequest', { patient: patient.id }, { source: patient.source }),
    getCoverageStatus(patient),
  ]);
  const medications = meds.entries
    .map((m) => toMedicationVM(m, coverage, patient.key))
    // Active orders first, then newest, which is how a pharmacy volunteer reviews a list.
    .sort((a, b) => Number(b.active) - Number(a.active) || (b.authoredIso ?? '').localeCompare(a.authoredIso ?? ''));
  return { medications, coverage };
}

export interface PapQueueItem {
  key: string;
  patient: PatientVM;
  medication: string;
  drug: PapDrug;
  authored: string | null;
}

export interface PapQueueResult {
  items: PapQueueItem[];
  checkedPatients: number;
  failedPatients: number;
  /** Listed brands whose coverage could not be checked; kept out of the queue but counted. */
  needsCoverageCheck: number;
}

const PAP_CONCURRENCY = 5;

/**
 * Screens every loaded patient's medication requests against the PAP rule. Each patient is
 * checked independently so one failed request does not hide everyone else's candidates, and
 * requests are limited to a few at a time out of courtesy to a shared public sandbox.
 */
export async function getPapQueue(patients: PatientVM[]): Promise<PapQueueResult> {
  const results: (MedicationsResult | null)[] = new Array(patients.length).fill(null);
  let failed = 0;
  let cursor = 0;

  const worker = async () => {
    while (cursor < patients.length) {
      const index = cursor++;
      try {
        results[index] = await getMedications(patients[index]);
      } catch {
        failed++;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(PAP_CONCURRENCY, patients.length) }, worker));

  const items: PapQueueItem[] = [];
  let needsCoverageCheck = 0;
  results.forEach((result, i) => {
    result?.medications.forEach((m) => {
      if (m.pap.status === 'eligible') {
        items.push({ key: m.key, patient: patients[i], medication: m.display, drug: m.pap.drug, authored: m.authored });
      } else if (m.pap.status === 'needsCoverageCheck') {
        needsCoverageCheck++;
      }
    });
  });

  return { items, checkedPatients: patients.length - failed, failedPatients: failed, needsCoverageCheck };
}

export async function getVitals(patient: PatientVM): Promise<VitalVM[]> {
  const { entries } = await search(
    'Observation',
    { patient: patient.id, category: 'vital-signs', _sort: '-date', _count: 20 },
    { source: patient.source },
  );
  return toVitalVMs(entries);
}

export async function getEncounters(patient: PatientVM): Promise<EncounterVM[]> {
  const { entries } = await search('Encounter', { patient: patient.id, _sort: '-date' }, { source: patient.source });
  return entries.map(toEncounterVM);
}
