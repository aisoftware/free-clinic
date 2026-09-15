import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card, SectionTitle } from '../components/Card';
import { CheckInChip } from '../components/Chip';
import { Screen } from '../components/Screen';
import { search } from '../lib/fhir/client';
import { toPatientVM } from '../lib/fhir/mappers';
import { Capability, can, isReadOnly, ROLES } from '../lib/roles';
import type { TabScreenProps } from '../navigation/navigators';
import type { RootTabParamList } from '../navigation/types';
import { CheckIn, CheckInStatus, useAppState } from '../state/AppState';
import { colors, radius, shadow, spacing, touchTarget, type } from '../theme';

type Props = TabScreenProps<RootTabParamList, 'TodayTab'>;
type IconName = ComponentProps<typeof Ionicons>['name'];
type Destination = 'patients' | 'intake' | 'pap';

interface QuickAction {
  id: string;
  label: string;
  detail: string;
  icon: IconName;
  destination: Destination;
  /** Shown when the role has this capability. */
  capability: Capability;
  /** Shown only to read-only roles, in place of workflow actions. */
  readOnlyOnly?: boolean;
}

// Quick actions follow the access table: a volunteer only sees shortcuts to work they are allowed
// to do, which keeps the home screen short and matches the minimum-necessary rule.
const QUICK_ACTIONS: QuickAction[] = [
  { id: 'checkin', label: 'Check in patient', detail: 'Find a patient and mark arrival', icon: 'log-in-outline', destination: 'patients', capability: 'patient.checkIn' },
  { id: 'intake', label: 'New intake', detail: 'Demographics, FPL, consent', icon: 'clipboard-outline', destination: 'intake', capability: 'intake.create' },
  { id: 'pap', label: 'PAP queue', detail: 'Patient assistance applications', icon: 'medkit-outline', destination: 'pap', capability: 'pap.view' },
  { id: 'meds', label: 'Medication review', detail: 'Open a chart, then Medications', icon: 'bandage-outline', destination: 'patients', capability: 'chart.medications' },
  { id: 'clinical', label: 'Clinical review', detail: 'Conditions and vital signs', icon: 'pulse-outline', destination: 'patients', capability: 'chart.vitals' },
  { id: 'mine', label: 'My patients (read-only)', detail: 'Observe charts without changes', icon: 'eye-outline', destination: 'patients', capability: 'patients.list', readOnlyOnly: true },
];

const COUNT_TILES: { id: string; label: string; statuses: CheckInStatus[]; tone: string }[] = [
  { id: 'checkedIn', label: 'Checked in', statuses: ['arrived', 'roomed', 'completed'], tone: colors.text },
  { id: 'waiting', label: 'Waiting', statuses: ['arrived'], tone: colors.warning },
  { id: 'inRoom', label: 'In room', statuses: ['roomed'], tone: colors.primary },
  { id: 'completed', label: 'Completed', statuses: ['completed'], tone: colors.success },
];

// Simulated shift for demonstration: completed visits first, then rooms, then the waiting area.
const SHIFT_PATTERN: CheckInStatus[] = ['completed', 'completed', 'roomed', 'roomed', 'arrived', 'arrived', 'arrived'];

function minutesSince(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function TodayScreen({ navigation }: Props) {
  const { role, setRole, checkIns, replaceCheckIns, loadedPatients, setLoadedPatients } = useAppState();
  const [simulating, setSimulating] = useState(false);

  const entries = Object.values(checkIns);
  const counts = useMemo(
    () => Object.fromEntries(COUNT_TILES.map((t) => [t.id, entries.filter((e) => t.statuses.includes(e.status)).length])),
    [entries],
  );
  const active = entries
    .filter((e) => e.status === 'arrived' || e.status === 'roomed')
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

  const readOnly = isReadOnly(role);
  const actions = QUICK_ACTIONS.filter((a) => can(role, a.capability) && (!a.readOnlyOnly || readOnly));

  const go = (destination: Destination) => {
    if (destination === 'patients') navigation.navigate('PatientsTab', { screen: 'PatientList' });
    if (destination === 'intake') navigation.navigate('IntakeTab');
    if (destination === 'pap') navigation.navigate('PapTab');
  };

  const openChart = (entry: CheckIn) =>
    navigation.navigate('PatientsTab', { screen: 'PatientDetail', params: { patient: entry.patient }, initial: false });

  const simulateShift = async () => {
    setSimulating(true);
    try {
      let patients = loadedPatients;
      if (patients.length === 0) {
        const result = await search('Patient', { _count: 20, _sort: 'family' });
        patients = result.entries.map((p) => toPatientVM(p, result.source));
        setLoadedPatients(patients);
      }
      // Deceased patients in the synthetic record are never placed in the waiting room.
      const eligible = patients.filter((p) => !p.deceased);
      replaceCheckIns(SHIFT_PATTERN.slice(0, eligible.length).map((status, i) => ({ patient: eligible[i], status })));
    } finally {
      setSimulating(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Screen padTopInset>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.clinic} accessibilityRole="header">
            Community Free Clinic
          </Text>
          <Text style={styles.date}>{today}</Text>
        </View>

        <View>
          <SectionTitle>Your role this shift</SectionTitle>
          <View style={styles.roles} accessibilityRole="radiogroup">
            {ROLES.map((r) => {
              const selected = r.id === role;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setRole(r.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${r.label}: ${r.summary}`}
                  style={({ pressed }) => [styles.roleChip, selected && styles.roleChipSelected, pressed && { opacity: 0.8 }]}
                >
                  <Text style={[styles.roleText, selected && styles.roleTextSelected]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.caption}>{ROLES.find((r) => r.id === role)?.summary}. Changes what every screen shows.</Text>
        </View>

        <View>
          <SectionTitle>Today</SectionTitle>
          <View style={styles.tiles}>
            {COUNT_TILES.map((tile) => (
              <View key={tile.id} style={styles.tile} accessible accessibilityLabel={`${tile.label}: ${counts[tile.id]}`}>
                <Text style={[styles.tileValue, { color: tile.tone }]}>{counts[tile.id]}</Text>
                <Text style={styles.tileLabel}>{tile.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.caption}>Counted from check-ins recorded on this device during the shift.</Text>
          <View style={styles.simRow}>
            {entries.length ? (
              <Button label="Clear shift" variant="ghost" icon="close-circle-outline" onPress={() => replaceCheckIns([])} />
            ) : (
              <Button
                label={simulating ? 'Loading patients...' : 'Simulate a morning shift'}
                variant="secondary"
                icon="play-outline"
                disabled={simulating}
                onPress={simulateShift}
                accessibilityHint="Checks in several synthetic patients so the counts and queue have data"
              />
            )}
          </View>
        </View>

        <View>
          <SectionTitle>Quick actions</SectionTitle>
          <View style={styles.actions}>
            {actions.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => go(a.destination)}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                accessibilityHint={a.detail}
                style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
              >
                <Ionicons name={a.icon} size={24} color={colors.primary} />
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.caption}>{a.detail}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <SectionTitle>Waiting and in room</SectionTitle>
          {active.length ? (
            <Card style={styles.queue}>
              {active.map((entry, i) => (
                <Pressable
                  key={entry.patient.key}
                  onPress={() => openChart(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={`${entry.patient.givenFirst}, ${entry.status === 'arrived' ? 'waiting' : 'in room'} ${minutesSince(entry.updatedAt)}`}
                  style={({ pressed }) => [styles.queueRow, i > 0 && styles.queueDivider, pressed && { opacity: 0.7 }]}
                >
                  <View style={styles.flex}>
                    <Text style={styles.queueName}>{entry.patient.name}</Text>
                    <Text style={styles.caption}>Since {minutesSince(entry.updatedAt)}</Text>
                  </View>
                  <CheckInChip status={entry.status} />
                </Pressable>
              ))}
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.body}>No one is waiting. Check-ins made from a patient chart appear here.</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  clinic: { ...type.title, color: colors.text },
  date: { ...type.body, color: colors.textMuted },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.xs },
  roleChip: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleText: { ...type.caption, fontWeight: '600', color: colors.text },
  roleTextSelected: { color: colors.textInverse },
  caption: { ...type.caption, color: colors.textMuted },
  body: { ...type.body, color: colors.textMuted },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.xs },
  tile: {
    flexGrow: 1,
    flexBasis: '40%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  tileValue: { ...type.title, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  tileLabel: { ...type.caption, fontWeight: '600', color: colors.textMuted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  action: {
    flexGrow: 1,
    flexBasis: '40%',
    minHeight: 96,
    padding: spacing.md,
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow,
  },
  actionPressed: { backgroundColor: colors.primaryMuted },
  actionLabel: { ...type.bodyStrong, color: colors.text },
  queue: { paddingVertical: spacing.xs },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget, paddingVertical: spacing.sm },
  queueDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  queueName: { ...type.bodyStrong, color: colors.text },
  emptyCard: { marginTop: spacing.xs },
  simRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
});
