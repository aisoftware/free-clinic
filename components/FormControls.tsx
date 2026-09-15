import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, touchTarget, type } from '../theme';

interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
}

export const TextField = forwardRef<TextInput, FieldProps>(function TextField({ label, hint, error, style, ...input }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        {...input}
        onFocus={(e) => {
          setFocused(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          input.onBlur?.(e);
        }}
        accessibilityLabel={label}
        accessibilityHint={hint}
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError, style]}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

export function Checkbox({ label, checked, onChange, error }: { label: string; checked: boolean; onChange: (v: boolean) => void; error?: string | null }) {
  return (
    <View>
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        style={({ pressed }) => [styles.checkRow, pressed && { opacity: 0.75 }]}
      >
        <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={26} color={checked ? colors.primary : colors.textMuted} />
        <Text style={styles.checkLabel}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function NumberStepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  decrementLabel,
  incrementLabel,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  decrementLabel: string;
  incrementLabel: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper} accessibilityRole="adjustable" accessibilityValue={{ min, max, now: value }} accessibilityLabel={label}>
        <StepButton icon="remove" label={decrementLabel} disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} />
        <Text style={styles.stepValue}>{value}</Text>
        <StepButton icon="add" label={incrementLabel} disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function StepButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.stepButton, disabled && { opacity: 0.4 }, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs, flexShrink: 1 },
  label: { ...type.bodyStrong, color: colors.text },
  input: {
    ...type.body,
    color: colors.text,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2, paddingHorizontal: spacing.md - 1 },
  inputError: { borderColor: colors.danger },
  hint: { ...type.caption, color: colors.textMuted },
  error: { ...type.caption, color: colors.danger, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: touchTarget },
  checkLabel: { ...type.body, color: colors.text, flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stepButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepValue: { ...type.title, color: colors.text, minWidth: 40, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
