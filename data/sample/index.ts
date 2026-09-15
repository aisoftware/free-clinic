import type { SearchParams, SearchResult } from '../../lib/fhir/client';
import type { Resource, ResourceByType, ResourceType } from '../../lib/fhir/types';
import { sampleConditions } from './conditions';
import { sampleCoverage } from './coverage';
import { sampleEncounters } from './encounters';
import { sampleMedicationRequests } from './medicationRequests';
import { sampleObservations } from './observations';
import { samplePatients } from './patients';

const store: { [K in ResourceType]: ResourceByType[K][] } = {
  Patient: samplePatients,
  Condition: sampleConditions,
  MedicationRequest: sampleMedicationRequests,
  Observation: sampleObservations,
  Encounter: sampleEncounters,
  Coverage: sampleCoverage,
  Consent: [],
};

function subjectOf(resource: Resource): string | undefined {
  if (resource.resourceType === 'Coverage') return (resource as ResourceByType['Coverage']).beneficiary.reference;
  return (resource as { subject?: { reference?: string } }).subject?.reference;
}

function dateOf(resource: Resource): string {
  const r = resource as {
    effectiveDateTime?: string;
    period?: { start?: string };
    authoredOn?: string;
    onsetDateTime?: string;
  };
  return r.effectiveDateTime ?? r.period?.start ?? r.authoredOn ?? r.onsetDateTime ?? '';
}

/**
 * In-memory implementation of the handful of FHIR search parameters the app uses, so screens
 * behave identically whether data came from a sandbox or from this bundle.
 */
export function searchSample<K extends ResourceType>(resourceType: K, params: SearchParams): SearchResult<ResourceByType[K]> {
  let rows = (store[resourceType] as ResourceByType[K][]).slice();

  const patient = params.patient;
  if (patient !== undefined) {
    rows = rows.filter((r) => subjectOf(r) === `Patient/${patient}`);
  }

  const name = typeof params.name === 'string' ? params.name.trim().toLowerCase() : '';
  if (resourceType === 'Patient' && name) {
    rows = rows.filter((r) =>
      ((r as ResourceByType['Patient']).name ?? []).some((n) =>
        [n.family, ...(n.given ?? [])].some((part) => part?.toLowerCase().startsWith(name)),
      ),
    );
  }

  if (params.category !== undefined) {
    rows = rows.filter((r) =>
      ((r as ResourceByType['Observation']).category ?? []).some((c) => c.coding?.some((cd) => cd.code === params.category)),
    );
  }

  const sort = params._sort;
  if (sort === 'family') {
    rows.sort((a, b) =>
      ((a as ResourceByType['Patient']).name?.[0]?.family ?? '').localeCompare((b as ResourceByType['Patient']).name?.[0]?.family ?? ''),
    );
  } else if (sort === '-date') {
    rows.sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
  }

  const total = rows.length;
  const count = Number(params._count);
  if (Number.isFinite(count) && count > 0) rows = rows.slice(0, count);

  return { entries: rows, total, source: 'sample' };
}
