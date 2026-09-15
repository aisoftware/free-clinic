import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import type { PatientsStackParamList } from '../navigation/types';
import { colors, spacing, type } from '../theme';

type Props = NativeStackScreenProps<PatientsStackParamList, 'PatientDetail'>;

export function PatientDetailScreen({ route }: Props) {
  const { patient } = route.params;
  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.title}>{patient.name}</Text>
        <Text style={styles.body}>Chart tabs are built in the next step.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.sm },
  title: { ...type.title, color: colors.text },
  body: { ...type.body, color: colors.textMuted },
});
