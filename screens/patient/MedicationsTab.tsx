import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import type { MedicationVM, PatientVM } from '../../lib/fhir/mappers';
import { getMedications } from '../../lib/fhir/queries';
import { CoverageStatus, formatUsd } from '../../lib/rules/pap';
import { useQuery } from '../../state/useQuery';
import { colors, spacing, type } from '../../theme';
import { TabBody } from './TabBody';

const COVERAGE_TEXT: Record<CoverageStatus, string> = {
  none: 'No Coverage resource on file. Listed brand-name medications are flagged as PAP candidates.',
  covered: 'Coverage on file. Patient assistance programs generally require no prescription coverage.',
  unknown: 'Coverage could not be checked, so PAP candidates need manual verification.',
};

function PapTag({ med }: { med: MedicationVM }) {
  switch (med.pap.status) {
    case 'eligible':
      return <Chip label="PAP eligible" tone="success" />;
    case 'needsCoverageCheck':
      return <Chip label="PAP: verify coverage" tone="warning" />;
    case 'hasCoverage':
      return <Chip label="PAP brand, has coverage" tone="neutral" />;
    default:
      return null;
  }
}

export function MedicationsTab({ patient }: { patient: PatientVM }) {
  const query = useQuery(() => getMedications(patient), [patient.key]);
  return (
    <TabBody
      patient={patient}
      query={query}
      isEmpty={(d) => d.medications.length === 0}
      emptyTitle="No medication requests on file"
      emptyBody="The server returned no MedicationRequest resources for this patient."
    >
      {(d) => (
        <>
          <Text style={styles.coverage}>{COVERAGE_TEXT[d.coverage]}</Text>
          {d.medications.map((m) => (
            <Card key={m.key} style={styles.card}>
              <Text style={styles.title}>{m.display}</Text>
              <View style={styles.chips}>
                <Chip label={m.status} tone={m.active ? 'primary' : 'neutral'} />
                <PapTag med={m} />
              </View>
              <Text style={styles.meta}>{m.authored ? `Authored ${m.authored}` : 'Authored date not recorded'}</Text>
              {m.pap.status === 'eligible' || m.pap.status === 'needsCoverageCheck' ? (
                <Text style={styles.meta}>
                  {m.pap.drug.manufacturer} program, est. retail {formatUsd(m.pap.drug.estimatedRetailUsd)}
                </Text>
              ) : null}
            </Card>
          ))}
        </>
      )}
    </TabBody>
  );
}

const styles = StyleSheet.create({
  coverage: { ...type.caption, color: colors.textMuted, marginBottom: spacing.xs },
  card: { gap: spacing.xs },
  title: { ...type.bodyStrong, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  meta: { ...type.caption, color: colors.textMuted },
});
