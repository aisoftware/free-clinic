import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, type } from '../theme';
import { SourceBanner } from './SourceBanner';

export const SYNTHETIC_NOTICE = 'Synthetic data from a public FHIR sandbox. Not a medical record.';

interface ScreenProps {
  children: ReactNode;
  /** Set when the screen sits under a navigator that does not already pad the bottom inset. */
  padBottomInset?: boolean;
}

/** Every screen carries the data-source banner and the synthetic-data notice. */
export function Screen({ children, padBottomInset = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <SourceBanner />
      <View style={styles.body}>{children}</View>
      <View style={[styles.footer, padBottomInset && { paddingBottom: spacing.sm + insets.bottom }]}>
        <Text style={styles.footerText} accessibilityRole="text">
          {SYNTHETIC_NOTICE}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  footerText: { ...type.caption, color: colors.textMuted, textAlign: 'center' },
});
