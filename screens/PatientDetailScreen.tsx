import type { StackScreenProps } from '@react-navigation/stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CheckInChip } from '../components/Chip';
import { LockNotice } from '../components/LockNotice';
import { Screen } from '../components/Screen';
import { Segment, SegmentedTabs } from '../components/SegmentedTabs';
import type { PatientVM } from '../lib/fhir/mappers';
import { Capability, can } from '../lib/roles';
import type { PatientsStackParamList } from '../navigation/types';
import { checkInStatusOf, useAppState } from '../state/AppState';
import { colors, spacing, type } from '../theme';
import { ConditionsTab } from './patient/ConditionsTab';
import { EncountersTab } from './patient/EncountersTab';
import { MedicationsTab } from './patient/MedicationsTab';
import { SummaryTab } from './patient/SummaryTab';
import { VitalsTab } from './patient/VitalsTab';

type Props = StackScreenProps<PatientsStackParamList, 'PatientDetail'>;
type TabKey = 'summary' | 'conditions' | 'medications' | 'vitals' | 'encounters';

const TABS: { key: TabKey; label: string; capability: Capability | null }[] = [
  { key: 'summary', label: 'Summary', capability: null },
  { key: 'conditions', label: 'Conditions', capability: 'chart.conditions' },
  { key: 'medications', label: 'Medications', capability: 'chart.medications' },
  { key: 'vitals', label: 'Vitals', capability: 'chart.vitals' },
  { key: 'encounters', label: 'Encounters', capability: 'chart.encounters' },
];

export function PatientDetailScreen({ route }: Props) {
  const { patient } = route.params;
  // Keyed by patient so no tab state or loaded chart data can carry over from another person.
  return <PatientChart key={patient.key} patient={patient} />;
}

function PatientChart({ patient }: { patient: PatientVM }) {
  const { role, checkIns } = useAppState();
  const [tab, setTab] = useState<TabKey>('summary');
  const [visited, setVisited] = useState<Set<TabKey>>(() => new Set(['summary']));

  const allowed = (key: TabKey) => {
    const capability = TABS.find((t) => t.key === key)?.capability;
    return !capability || can(role, capability);
  };

  const segments: Segment<TabKey>[] = TABS.map((t) => ({ key: t.key, label: t.label, locked: !allowed(t.key) }));
  const current = TABS.find((t) => t.key === tab);

  const select = (key: TabKey) => {
    setTab(key);
    setVisited((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  };

  const meta = [patient.age !== null ? `${patient.age} y` : null, patient.sex, patient.mrnShort ? `MRN ${patient.mrnShort}` : 'No ID']
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name} accessibilityRole="header">
            {patient.name}
          </Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
        <CheckInChip status={checkInStatusOf(checkIns, patient.key)} />
      </View>

      <SegmentedTabs segments={segments} value={tab} onChange={select} />

      <View style={styles.body}>
        {current?.capability && !allowed(tab) ? (
          // Locked tabs never mount their data component, so the request is not even made.
          <View style={styles.locked}>
            <LockNotice capability={current.capability} />
          </View>
        ) : null}
        {TABS.filter((t) => visited.has(t.key) && allowed(t.key)).map((t) => (
          <View key={t.key} style={[styles.pane, t.key !== tab && styles.hidden]}>
            {t.key === 'summary' && <SummaryTab patient={patient} />}
            {t.key === 'conditions' && <ConditionsTab patient={patient} />}
            {t.key === 'medications' && <MedicationsTab patient={patient} />}
            {t.key === 'vitals' && <VitalsTab patient={patient} />}
            {t.key === 'encounters' && <EncountersTab patient={patient} />}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerText: { flex: 1 },
  name: { ...type.heading, color: colors.text },
  meta: { ...type.caption, color: colors.textMuted },
  body: { flex: 1 },
  pane: { flex: 1 },
  hidden: { display: 'none' },
  locked: { padding: spacing.lg, paddingTop: spacing.sm },
});
