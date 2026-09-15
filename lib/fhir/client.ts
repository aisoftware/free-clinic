import { searchSample } from '../../data/sample';
import type { Bundle, ResourceByType, ResourceType } from './types';

export type DataSource = 'smart' | 'sample';
export type RemoteSource = Exclude<DataSource, 'sample'>;

export const SERVERS: Record<RemoteSource, { label: string; baseUrl: string }> = {
  smart: { label: 'SMART Health IT R4 sandbox', baseUrl: 'https://r4.smarthealthit.org' },
};

export const SOURCE_LABELS: Record<DataSource, string> = {
  smart: SERVERS.smart.label,
  sample: 'Bundled sample data',
};

const TIMEOUT_MS = 8000;
const ATTEMPTS_PER_SERVER = 2; // one try plus one retry
const SKIP_FAILED_SERVER_MS = 60_000;

export type SearchParams = Record<string, string | number | undefined>;

export interface SearchResult<T> {
  entries: T[];
  total?: number;
  source: DataSource;
}

export interface SearchOptions {
  /**
   * Resource ids are only meaningful on the server that issued them, so queries scoped to a
   * patient must go to that patient's server. A pinned remote search never falls back.
   */
  source?: DataSource;
  /** User-initiated refresh: try every server again even if it failed within the last minute. */
  fresh?: boolean;
}

export type FhirErrorKind = 'timeout' | 'network' | 'http' | 'parse';

export class FhirError extends Error {
  constructor(
    message: string,
    public readonly kind: FhirErrorKind,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'FhirError';
  }

  get retryable(): boolean {
    return this.kind !== 'http' || (this.status !== undefined && this.status >= 500);
  }
}

// ---- Source status, observed by the data-source banner -------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();
let lastSource: DataSource | null = null;
let forceSample = false;
const failedAt: Partial<Record<RemoteSource, number>> = {};

function publish(source: DataSource) {
  if (source === lastSource) return;
  lastSource = source;
  listeners.forEach((l) => l());
}

/** 'forced' means sample data was chosen on the About screen rather than reached by fallback. */
export type SourceSnapshot = DataSource | 'forced' | null;

export const sourceStatus = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: (): SourceSnapshot => (forceSample ? 'forced' : lastSource),
};

/** Demo control: lets a reviewer see the offline experience without disabling the network. */
export function setForceSample(value: boolean) {
  forceSample = value;
  listeners.forEach((l) => l());
}

export function isForcingSample() {
  return forceSample;
}

// ---- Search --------------------------------------------------------------------------------

export function buildUrl(source: RemoteSource, resourceType: ResourceType, params: SearchParams) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${SERVERS[source].baseUrl}/${resourceType}${query ? `?${query}` : ''}`;
}

async function fetchBundle(url: string): Promise<Bundle> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    // Only the Accept header: anything more turns a browser request into a CORS preflight,
    // which the SMART sandbox rejects.
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/fhir+json' },
      signal: controller.signal,
    });
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    throw new FhirError(aborted ? 'The FHIR server did not respond in time.' : 'Could not reach the FHIR server.', aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw new FhirError(`The FHIR server returned HTTP ${response.status}.`, 'http', response.status);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FhirError('The FHIR server returned a response that was not JSON.', 'parse');
  }
  if (!body || typeof body !== 'object' || (body as { resourceType?: unknown }).resourceType !== 'Bundle') {
    throw new FhirError('The FHIR server did not return a search Bundle.', 'parse');
  }
  return body as Bundle;
}

async function searchRemote<K extends ResourceType>(
  source: RemoteSource,
  resourceType: K,
  params: SearchParams,
): Promise<SearchResult<ResourceByType[K]>> {
  const url = buildUrl(source, resourceType, params);
  let lastError: FhirError | undefined;
  for (let attempt = 0; attempt < ATTEMPTS_PER_SERVER; attempt++) {
    try {
      const bundle = await fetchBundle(url);
      delete failedAt[source];
      const entries = (bundle.entry ?? [])
        .map((e) => e.resource)
        .filter((r): r is ResourceByType[K] => !!r && r.resourceType === resourceType);
      return { entries, total: bundle.total, source };
    } catch (e) {
      lastError = e instanceof FhirError ? e : new FhirError(String(e), 'network');
      if (!lastError.retryable) break;
    }
  }
  failedAt[source] = Date.now();
  throw lastError;
}

function recentlyFailed(source: RemoteSource) {
  const at = failedAt[source];
  return at !== undefined && Date.now() - at < SKIP_FAILED_SERVER_MS;
}

/**
 * Typed FHIR search. Unpinned searches try the SMART sandbox, then bundled sample data, so the
 * demo never shows a blank screen. Pinned searches stay on one server and surface errors.
 *
 * There is deliberately no second public server: open community servers such as HAPI hold
 * uploads from anyone, often unnamed or malformed patients, which is worse for a clinic demo
 * than clearly labeled synthetic sample data.
 */
export async function search<K extends ResourceType>(
  resourceType: K,
  params: SearchParams = {},
  options: SearchOptions = {},
): Promise<SearchResult<ResourceByType[K]>> {
  const pinned = options.source;

  // Forcing sample data only redirects list-style searches; a chart opened from a sandbox stays on
  // its server rather than silently showing another record set's empty results.
  if (pinned === 'sample' || (forceSample && !pinned)) {
    if (!pinned) publish('sample');
    return searchSample(resourceType, params);
  }

  if (pinned) {
    return searchRemote(pinned, resourceType, params);
  }

  // A server that just failed is skipped for a minute so every screen does not wait through the
  // same timeouts again; pull to refresh overrides this.
  const order: RemoteSource[] = ['smart'];
  const candidates = options.fresh ? order : order.filter((s) => !recentlyFailed(s));
  for (const source of candidates) {
    try {
      const result = await searchRemote(source, resourceType, params);
      publish(source);
      return result;
    } catch {
      // Fall through; the bundled sample data below is always available.
    }
  }
  publish('sample');
  return searchSample(resourceType, params);
}
