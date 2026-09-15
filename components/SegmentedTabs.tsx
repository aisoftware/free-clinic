import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, touchTarget, type } from '../theme';

export interface Segment<K extends string> {
  key: K;
  label: string;
  locked?: boolean;
}

interface Props<K extends string> {
  segments: Segment<K>[];
  value: K;
  onChange: (key: K) => void;
}

export function SegmentedTabs<K extends string>({ segments, value, onChange }: Props<K>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
      style={styles.scroll}
    >
      {segments.map((s) => {
        const selected = s.key === value;
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={s.locked ? `${s.label}, locked for this role` : s.label}
            style={({ pressed }) => [styles.segment, selected && styles.selected, pressed && { opacity: 0.8 }]}
          >
            {s.locked ? <Ionicons name="lock-closed" size={13} color={selected ? colors.textInverse : colors.textMuted} /> : null}
            <Text style={[styles.label, selected && styles.labelSelected, s.locked && !selected && styles.labelLocked]}>{s.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  segment: {
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...type.caption, fontWeight: '600', color: colors.text },
  labelSelected: { color: colors.textInverse },
  labelLocked: { color: colors.textMuted },
});
