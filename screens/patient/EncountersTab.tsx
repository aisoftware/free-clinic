import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import type { PatientVM } from '../../lib/fhir/mappers';
import { getEncounters } from '../../lib/fhir/queries';
import { useQuery } from '../../state/useQuery';
import { colors, spacing, type } from '../../theme';
import { TabBody } from './TabBody';

export function EncountersTab({ patient }: { patient: PatientVM }) {
  const query = useQuery(() => getEncounters(patient), [patient.key]);
  return (
    <TabBody
      patient={patient}
      query={query}
      isEmpty={(rows) => rows.length === 0}
      emptyTitle="No encounters on file"
      emptyBody="The server returned no Encounter resources for this patient."
    >
      {(rows) =>
        rows.map((e) => (
          <Card key={e.id} style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.title}>{e.type}</Text>
              <Chip label={e.classLabel} tone={e.classLabel === 'Emergency' ? 'danger' : 'primary'} />
            </View>
            <Text style={styles.meta}>{e.when}</Text>
            {e.reason ? <Text style={styles.reason}>Reason: {e.reason}</Text> : null}
          </Card>
        ))
      }
    </TabBody>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  top: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { ...type.bodyStrong, color: colors.text, flexShrink: 1 },
  meta: { ...type.caption, color: colors.textMuted },
  reason: { ...type.caption, color: colors.text },
});
