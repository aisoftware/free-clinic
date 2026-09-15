import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, type } from '../theme';
import { SourceBanner } from './SourceBanner';

export const SYNTHETIC_NOTICE = 'Synthetic data from a public FHIR sandbox. Not a medical record.';

interface ScreenProps {
  children: ReactNode;
  /** Set when the screen has no navigation header, so the banner and content clear the status bar. */
  padTopInset?: boolean;
}

/** Every screen carries the data-source banner and the synthetic-data notice. */
export function Screen({ children, padTopInset = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, padTopInset && { paddingTop: insets.top }]}>
      <SourceBanner />
      <View style={styles.body}>{children}</View>
      <View style={styles.footer}>
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
