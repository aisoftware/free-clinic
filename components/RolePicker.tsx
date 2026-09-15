import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { roleLabel, ROLES } from '../lib/roles';
import { useAppState } from '../state/AppState';
import { colors, radius, spacing, touchTarget, type } from '../theme';

/** Compact header control. The active role is always visible because it decides what is shown. */
export function RoleHeaderButton() {
  const { role } = useAppState();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Volunteer role: ${roleLabel(role)}. Change role`}
        style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
        hitSlop={8}
      >
        <Ionicons name="id-card-outline" size={16} color={colors.primary} />
        <Text style={styles.headerText} numberOfLines={1}>
          {roleLabel(role)}
        </Text>
      </Pressable>
      <RolePickerModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function RolePickerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { role, setRole } = useAppState();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close role picker" />
      <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]} accessibilityViewIsModal>
        <Text style={styles.sheetTitle}>Volunteer role</Text>
        <Text style={styles.sheetBody}>The role controls which patient information and actions appear.</Text>
        {ROLES.map((r) => {
          const selected = r.id === role;
          return (
            <Pressable
              key={r.id}
              onPress={() => {
                setRole(r.id);
                onClose();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? colors.primary : colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{r.label}</Text>
                <Text style={styles.optionSummary}>{r.summary}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
    maxWidth: 170,
  },
  headerText: { ...type.caption, fontWeight: '600', color: colors.primary, flexShrink: 1 },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(21, 32, 43, 0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sheetTitle: { ...type.heading, color: colors.text },
  sheetBody: { ...type.caption, color: colors.textMuted, marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touchTarget,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  optionLabel: { ...type.bodyStrong, color: colors.text },
  optionSummary: { ...type.caption, color: colors.textMuted },
});
