import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import type { PatientVM } from '../../lib/fhir/mappers';
import { getConditions } from '../../lib/fhir/queries';
import { useQuery } from '../../state/useQuery';
import { colors, spacing, type } from '../../theme';
import { TabBody } from './TabBody';

export function ConditionsTab({ patient }: { patient: PatientVM }) {
  const query = useQuery(() => getConditions(patient), [patient.key]);
  return (
    <TabBody
      patient={patient}
      query={query}
      isEmpty={(rows) => rows.length === 0}
      emptyTitle="No conditions on file"
      emptyBody="The server returned no Condition resources for this patient."
    >
      {(rows) =>
        rows.map((c) => (
          <Card key={c.id} style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.title}>{c.display}</Text>
              <Chip label={c.clinicalStatus} tone={c.active ? 'warning' : 'neutral'} />
            </View>
            <Text style={styles.meta}>{c.onset ? `Onset ${c.onset}` : 'Onset not recorded'}</Text>
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
});
