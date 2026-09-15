import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing, type } from '../theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.section} accessibilityRole="header">
      {children.toUpperCase()}
    </Text>
  );
}

export function FieldRow({ label, value, last = false }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.field, !last && styles.fieldDivider]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.fieldValue} selectable>
          {value}
        </Text>
      ) : (
        <View style={styles.fieldValueWrap}>{value}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, ...shadow },
  section: { ...type.label, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  field: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: spacing.sm },
  fieldDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  fieldLabel: { ...type.body, color: colors.textMuted },
  fieldValue: { ...type.bodyStrong, color: colors.text, flexShrink: 1, textAlign: 'right' },
  fieldValueWrap: { flexShrink: 1, alignItems: 'flex-end' },
});
