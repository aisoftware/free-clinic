import { StyleSheet, Text, View } from 'react-native';

import type { CheckInStatus } from '../state/AppState';
import { colors, radius, spacing, type } from '../theme';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
  primary: { bg: colors.primaryMuted, fg: colors.primary },
  success: { bg: colors.successMuted, fg: colors.success },
  warning: { bg: colors.warningMuted, fg: colors.warning },
  danger: { bg: colors.dangerMuted, fg: colors.danger },
  info: { bg: colors.infoMuted, fg: colors.info },
};

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export const CHECK_IN_LABELS: Record<CheckInStatus, string> = {
  notArrived: 'Not arrived',
  arrived: 'Waiting',
  roomed: 'In room',
  completed: 'Completed',
};

const CHECK_IN_TONES: Record<CheckInStatus, Tone> = {
  notArrived: 'neutral',
  arrived: 'warning',
  roomed: 'primary',
  completed: 'success',
};

export function CheckInChip({ status }: { status: CheckInStatus }) {
  return <Chip label={CHECK_IN_LABELS[status]} tone={CHECK_IN_TONES[status]} />;
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  text: { ...type.label },
});
