import { useHeaderHeight } from '@react-navigation/elements';
import { useEffect, useMemo, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '../components/Card';
import { LockNotice } from '../components/LockNotice';
import { Screen } from '../components/Screen';
import { EmptyState, ErrorState, SkeletonRows } from '../components/StateViews';
import { search } from '../lib/fhir/client';
import { PatientVM, toPatientVM } from '../lib/fhir/mappers';
import { getPapQueue, PapQueueItem, PapQueueResult } from '../lib/fhir/queries';
import { formatUsd } from '../lib/rules/pap';
import { can } from '../lib/roles';
import { PapProgress, PapStep, useAppState } from '../state/AppState';
import { useQuery } from '../state/useQuery';
import { colors, radius, shadow, spacing, touchTarget, type } from '../theme';

export const PAP_STEPS: { id: PapStep; short: string; label: string }[] = [
  { id: 'identified', short: 'Identified', label: 'Identified' },
  { id: 'applicationSent', short: 'Applied', label: 'Application sent' },
  { id: 'approved', short: 'Approved', label: 'Approved' },
  { id: 'shipped', short: 'Shipped', label: 'Shipped' },
  { id: 'dispensed', short: 'Dispensed', label: 'Dispensed' },
];

const DEFAULT_PROGRESS: PapProgress = { step: 'identified', notes: '' };

export function PapQueueScreen() {
  const { role, loadedPatients, setLoadedPatients, pap, updatePap, dataEpoch } = useAppState();
  const headerHeight = useHeaderHeight();
  const allowed = can(role, 'pap.view');
  const editable = can(role, 'pap.update');
  const patientKeys = loadedPatients.map((p) => p.key).join('|');

  const last = useRef<{ keys: string; epoch: number; value: PapQueueResult & { patients: PatientVM[] } } | null>(null);

  const query = useQuery(
    async ({ fresh }) => {
      // Roles without access never trigger the medication and coverage searches.
      if (!allowed) return { items: [], checkedPatients: 0, failedPatients: 0, needsCoverageCheck: 0, patients: [] };
      const epochChanged = last.current !== null && last.current.epoch !== dataEpoch;
      if (!fresh && !epochChanged && last.current && last.current.keys === patientKeys) return last.current.value;
      // The queue works from the patients on today's list. If the Patients tab has not been
      // opened yet, load the same list here so the queue is never empty for that reason alone.
      let patients = loadedPatients;
      if (patients.length === 0 || fresh || epochChanged) {
        const result = await search('Patient', { _count: 20, _sort: 'family' }, { fresh });
        patients = result.entries.map((p) => toPatientVM(p, result.source));
      }
      const queue = await getPapQueue(patients);
      if (queue.checkedPatients === 0 && patients.length > 0) {
        throw new Error(`None of the ${patients.length} patients could be checked.`);
      }
      const value = { ...queue, patients };
      last.current = { keys: patients.map((p) => p.key).join('|'), epoch: dataEpoch, value };
      return value;
    },
    [allowed, patientKeys, dataEpoch],
  );

  useEffect(() => {
    if (query.data?.patients.length && query.data.patients !== loadedPatients) setLoadedPatients(query.data.patients);
    // Only publish a freshly loaded list; loadedPatients changing re-runs the query itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const totals = useMemo(() => {
    let open = 0;
    let dispensed = 0;
    for (const item of query.data?.items ?? []) {
      const step = (pap[item.key] ?? DEFAULT_PROGRESS).step;
      if (step === 'dispensed') dispensed += item.drug.estimatedRetailUsd;
      else open += item.drug.estimatedRetailUsd;
    }
    return { open, dispensed };
  }, [query.data, pap]);

  if (!allowed) {
    return (
      <Screen>
        <View style={styles.pad}>
          <LockNotice capability="pap.view" />
        </View>
      </Screen>
    );
  }

  let body;
  if (query.loading && !query.data) {
    body = <SkeletonRows count={4} />;
  } else if (query.error && !query.data) {
    body = <ErrorState message={query.error} onRetry={query.reload} />;
  } else {
    const data = query.data;
    body = (
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={query.refreshing} onRefresh={query.refresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>Estimated medication value in queue</Text>
              <Text style={styles.totalValue} accessibilityLiveRegion="polite">
                {formatUsd(totals.open)}
              </Text>
              <Text style={styles.caption}>
                Dispensed so far: {formatUsd(totals.dispensed)} · {data?.items.length === 1 ? '1 medication' : `${data?.items.length ?? 0} medications`}
              </Text>
            </Card>
            <Text style={styles.caption}>
              Checked {data?.checkedPatients ?? 0} loaded patients: listed brand-name medication, active order, no Coverage resource on
              file. Candidates for review, not eligibility decisions. Prices are illustrative.
            </Text>
            {data && data.failedPatients > 0 ? (
              <Text style={styles.warning}>{data.failedPatients} patients could not be checked. Pull down to retry.</Text>
            ) : null}
            {data && data.needsCoverageCheck > 0 ? (
              <Text style={styles.warning}>{data.needsCoverageCheck} listed medications need a manual coverage check.</Text>
            ) : null}
            {!editable ? <LockNotice capability="pap.update" /> : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="medkit-outline"
            title="No PAP candidates"
            body="None of the loaded patients has an active listed brand-name medication without coverage."
          />
        }
        renderItem={({ item }) => (
          <PapRow
            item={item}
            progress={pap[item.key] ?? DEFAULT_PROGRESS}
            editable={editable}
            onChange={(change) => updatePap(item.key, change)}
          />
        )}
      />
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
        {body}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function PapRow({
  item,
  progress,
  editable,
  onChange,
}: {
  item: PapQueueItem;
  progress: PapProgress;
  editable: boolean;
  onChange: (change: Partial<PapProgress>) => void;
}) {
  const currentIndex = PAP_STEPS.findIndex((s) => s.id === progress.step);
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.flex}>
          <Text style={styles.patient}>{item.patient.name}</Text>
          <Text style={styles.medication}>{item.medication}</Text>
          <Text style={styles.caption}>
            {item.drug.manufacturer}
            {item.authored ? ` · ordered ${item.authored}` : ''}
          </Text>
        </View>
        <View style={styles.value}>
          <Text style={styles.valueAmount}>{formatUsd(item.drug.estimatedRetailUsd)}</Text>
          <Text style={styles.caption}>est. retail</Text>
        </View>
      </View>

      <View style={styles.stepper} accessibilityRole="radiogroup" accessibilityLabel={`Application status: ${PAP_STEPS[currentIndex].label}`}>
        {PAP_STEPS.map((s, i) => {
          const done = i <= currentIndex;
          return (
            <Pressable
              key={s.id}
              disabled={!editable}
              onPress={() => onChange({ step: s.id })}
              accessibilityRole="radio"
              accessibilityState={{ selected: i === currentIndex, disabled: !editable }}
              accessibilityLabel={s.label}
              style={({ pressed }) => [styles.step, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.stepBar, done && styles.stepBarDone]} />
              <Text style={[styles.stepText, i === currentIndex && styles.stepTextCurrent]} numberOfLines={1} adjustsFontSizeToFit>
                {s.short}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.caption}>Status: {PAP_STEPS[currentIndex].label}</Text>

      {editable ? (
        <TextInput
          value={progress.notes}
          onChangeText={(notes) => onChange({ notes })}
          placeholder="Notes (program contact, documents needed, ship date)"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.notes}
          accessibilityLabel={`Notes for ${item.medication}`}
        />
      ) : progress.notes ? (
        <Text style={styles.notesReadOnly}>Notes: {progress.notes}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { padding: spacing.lg },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  headerWrap: { gap: spacing.sm },
  totalCard: { gap: 2, borderLeftWidth: 4, borderLeftColor: colors.success },
  totalLabel: { ...type.label, color: colors.textMuted },
  totalValue: { ...type.title, fontSize: 30, lineHeight: 36, color: colors.text, fontVariant: ['tabular-nums'] },
  caption: { ...type.caption, color: colors.textMuted },
  warning: { ...type.caption, color: colors.warning, fontWeight: '600' },
  row: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm, ...shadow },
  rowTop: { flexDirection: 'row', gap: spacing.md },
  patient: { ...type.bodyStrong, color: colors.text },
  medication: { ...type.body, color: colors.text },
  value: { alignItems: 'flex-end' },
  valueAmount: { ...type.heading, color: colors.success, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', gap: 4 },
  step: { flex: 1, minHeight: touchTarget, justifyContent: 'center', gap: 4 },
  stepBar: { height: 6, borderRadius: radius.pill, backgroundColor: colors.border },
  stepBarDone: { backgroundColor: colors.primary },
  stepText: { fontSize: 11, lineHeight: 14, color: colors.textMuted, textAlign: 'center' },
  stepTextCurrent: { color: colors.primary, fontWeight: '700' },
  notes: {
    ...type.body,
    color: colors.text,
    minHeight: 64,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
  },
  notesReadOnly: { ...type.caption, color: colors.text },
});
