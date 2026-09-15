import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

import { FhirError } from '../lib/fhir/client';

export interface QueryState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  reload: () => void;
  refresh: () => void;
}

/** Runs an async loader, ignoring responses that arrive after a newer request started. */
export interface LoadContext {
  /** True for pull to refresh and retry, when the user explicitly asked to try the network again. */
  fresh: boolean;
}

export function useQuery<T>(loader: (ctx: LoadContext) => Promise<T>, deps: DependencyList): QueryState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async (mode: 'initial' | 'retry' | 'refresh') => {
    const id = ++requestId.current;
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current({ fresh: mode !== 'initial' });
      if (id === requestId.current) setData(result);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof FhirError || e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    run('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    error,
    loading,
    refreshing,
    reload: useCallback(() => run('retry'), [run]),
    refresh: useCallback(() => run('refresh'), [run]),
  };
}
