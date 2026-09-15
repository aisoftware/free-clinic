import { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { EmptyState, ErrorState, SkeletonRows } from '../../components/StateViews';
import { SOURCE_LABELS } from '../../lib/fhir/client';
import type { PatientVM } from '../../lib/fhir/mappers';
import type { QueryState } from '../../state/useQuery';
import { colors, spacing } from '../../theme';

interface Props<T> {
  patient: PatientVM;
  query: QueryState<T>;
  isEmpty: (data: T) => boolean;
  emptyTitle: string;
  emptyBody?: string;
  children: (data: T) => ReactNode;
}

/** Loading, error, empty, and pull-to-refresh handling shared by every chart tab. */
export function TabBody<T>({ patient, query, isEmpty, emptyTitle, emptyBody, children }: Props<T>) {
  if (query.loading && query.data === undefined) return <SkeletonRows count={4} />;

  if (query.error && query.data === undefined) {
    // A sandbox patient's chart cannot be replaced with sample data: the ids belong to a
    // different server, and showing another person's record would be worse than showing none.
    return (
      <ScrollView contentContainerStyle={styles.fill}>
        <ErrorState
          message={`${query.error} This chart comes from the ${SOURCE_LABELS[patient.source]}, so it cannot be shown offline. Try again, or go back to the patient list to continue with sample data.`}
          onRetry={query.reload}
        />
      </ScrollView>
    );
  }

  const data = query.data as T;
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={query.refreshing} onRefresh={query.refresh} tintColor={colors.primary} />}
    >
      {isEmpty(data) ? <EmptyState title={emptyTitle} body={emptyBody} /> : children(data)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, flexGrow: 1 },
  fill: { flexGrow: 1, justifyContent: 'center' },
});
