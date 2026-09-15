import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Capability, lockReason } from '../lib/roles';
import { useAppState } from '../state/AppState';
import { colors, radius, spacing, type } from '../theme';

/** Makes an access decision visible instead of silently omitting information. */
export function LockNotice({ capability, compact = false }: { capability: Capability; compact?: boolean }) {
  const { role } = useAppState();
  return (
    <View style={[styles.wrap, compact && styles.compact]} accessibilityRole="text">
      <Ionicons name="lock-closed" size={compact ? 14 : 16} color={colors.textMuted} />
      <Text style={styles.text}>{lockReason(role, capability)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  compact: { padding: 0, backgroundColor: 'transparent' },
  text: { ...type.caption, color: colors.textMuted, flex: 1 },
});
