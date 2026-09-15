import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card, FieldRow, SectionTitle } from '../../components/Card';
import { CHECK_IN_LABELS, CheckInChip, Chip } from '../../components/Chip';
import { LockNotice } from '../../components/LockNotice';
import { SOURCE_LABELS } from '../../lib/fhir/client';
import type { PatientVM } from '../../lib/fhir/mappers';
import { can, roleLabel } from '../../lib/roles';
import { CheckInStatus, checkInStatusOf, useAppState } from '../../state/AppState';
import { colors, spacing, type } from '../../theme';

const NEXT_STEPS: { status: CheckInStatus; label: string; icon: 'log-in-outline' | 'bed-outline' | 'checkmark-done-outline' }[] = [
  { status: 'arrived', label: 'Arrived', icon: 'log-in-outline' },
  { status: 'roomed', label: 'Roomed', icon: 'bed-outline' },
  { status: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
];

export function SummaryTab({ patient }: { patient: PatientVM }) {
  const { role, checkIns, setCheckIn } = useAppState();
  const status = checkInStatusOf(checkIns, patient.key);
  const record = checkIns[patient.key];
  const canCheckIn = can(role, 'patient.checkIn');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle>Check-in</SectionTitle>
      <Card style={styles.gap}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <CheckInChip status={status} />
        </View>
        {record ? (
          <Text style={styles.caption}>
            Updated {new Date(record.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} by{' '}
            {roleLabel(record.updatedBy)}
          </Text>
        ) : null}
        {canCheckIn ? (
          <View style={styles.buttons}>
            {NEXT_STEPS.map((s) => (
              <Button
                key={s.status}
                label={s.label}
                icon={s.icon}
                variant={status === s.status ? 'primary' : 'secondary'}
                onPress={() => setCheckIn(patient.key, s.status)}
                accessibilityHint={`Sets check-in status to ${CHECK_IN_LABELS[s.status]}`}
                style={styles.button}
              />
            ))}
            {status !== 'notArrived' ? (
              <Button label="Reset" variant="ghost" onPress={() => setCheckIn(patient.key, 'notArrived')} style={styles.button} />
            ) : null}
          </View>
        ) : (
          <LockNotice capability="patient.checkIn" compact />
        )}
      </Card>

      <SectionTitle>Demographics</SectionTitle>
      <Card>
        <FieldRow label="Name" value={patient.givenFirst} />
        <FieldRow label="Date of birth" value={patient.birthDateLabel ?? 'Not recorded'} />
        <FieldRow label="Age" value={patient.age !== null ? `${patient.age} years` : 'Unknown'} />
        <FieldRow label="Sex" value={patient.sex} />
        <FieldRow label="Preferred language" value={patient.language ?? 'Not recorded'} />
        <FieldRow
          label="Phone"
          value={can(role, 'patient.contact') ? patient.phone ?? 'Not recorded' : <LockNotice capability="patient.contact" compact />}
        />
        <FieldRow label="MRN" value={patient.mrn ?? 'No ID'} />
        {patient.deceased ? <FieldRow label="Record note" value={<Chip label="Deceased in source record" tone="danger" />} /> : null}
        <FieldRow label="Record source" value={SOURCE_LABELS[patient.source]} last />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingTop: 0, gap: spacing.xs },
  gap: { gap: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { ...type.body, color: colors.textMuted },
  caption: { ...type.caption, color: colors.textMuted },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: { flexGrow: 1, flexBasis: 140 },
});
