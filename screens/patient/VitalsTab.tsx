import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Sparkline } from '../../components/Sparkline';
import type { PatientVM, VitalVM } from '../../lib/fhir/mappers';
import { getVitals } from '../../lib/fhir/queries';
import { useQuery } from '../../state/useQuery';
import { colors, spacing, type } from '../../theme';
import { TabBody } from './TabBody';

const TREND_ICONS = { up: 'arrow-up', down: 'arrow-down', flat: 'remove' } as const;
const TREND_WORDS = { up: 'rising', down: 'falling', flat: 'stable' } as const;

function VitalCard({ vital }: { vital: VitalVM }) {
  if (!vital.latest) {
    return (
      <Card style={styles.card}>
        <Text style={styles.label}>{vital.label}</Text>
        <Text style={styles.missing}>Not recorded</Text>
        <Text style={styles.meta}>None in the latest 20 vital-sign readings</Text>
      </Card>
    );
  }

  const showTrend = vital.series.length >= 3 && vital.trend;
  return (
    <Card style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{vital.label}</Text>
        {showTrend && vital.trend ? (
          <Ionicons name={TREND_ICONS[vital.trend]} size={16} color={colors.textMuted} accessibilityLabel={`Trend ${TREND_WORDS[vital.trend]}`} />
        ) : null}
      </View>
      <Text style={styles.value} accessibilityLabel={`${vital.label} ${vital.latest} ${vital.unit}`}>
        {vital.latest}
        <Text style={styles.unit}> {vital.unit}</Text>
      </Text>
      {vital.secondary ? <Text style={styles.meta}>{vital.secondary}</Text> : null}
      {showTrend ? (
        <Sparkline
          values={vital.series.map((p) => p.value)}
          values2={vital.kind === 'bp' ? vital.series.map((p) => p.value2) : undefined}
          label={`${vital.label} over the last ${vital.series.length} readings`}
        />
      ) : null}
      {showTrend && vital.kind === 'bp' ? (
        <View style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: colors.primary }]} />
          <Text style={styles.meta}>Systolic</Text>
          <View style={[styles.swatch, { backgroundColor: colors.info }]} />
          <Text style={styles.meta}>Diastolic</Text>
        </View>
      ) : null}
      <Text style={styles.meta}>{vital.takenOn}</Text>
    </Card>
  );
}

export function VitalsTab({ patient }: { patient: PatientVM }) {
  const query = useQuery(() => getVitals(patient), [patient.key]);
  return (
    <TabBody
      patient={patient}
      query={query}
      isEmpty={(vitals) => vitals.every((v) => !v.latest)}
      emptyTitle="No vital signs on file"
      emptyBody="The server returned no vital-sign Observations for this patient."
    >
      {(vitals) => (
        <>
          <View style={styles.grid}>
            {vitals.map((v) => (
              <View key={v.kind} style={styles.cell}>
                <VitalCard vital={v} />
              </View>
            ))}
          </View>
          <Text style={styles.footnote}>Latest value per measurement from the 20 most recent vital-sign observations.</Text>
        </>
      )}
    </TabBody>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { flexBasis: '50%', flexGrow: 1, minWidth: 150, padding: spacing.xs },
  card: { flex: 1, gap: 4, padding: spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...type.label, color: colors.textMuted },
  value: { ...type.title, color: colors.text, fontVariant: ['tabular-nums'] },
  unit: { ...type.caption, color: colors.textMuted, fontWeight: '600' },
  missing: { ...type.bodyStrong, color: colors.textMuted },
  meta: { ...type.caption, color: colors.textMuted },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  swatch: { width: 10, height: 3, borderRadius: 2, marginLeft: 2 },
  footnote: { ...type.caption, color: colors.textMuted, marginTop: spacing.sm },
});
