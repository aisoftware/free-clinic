import { Ionicons } from '@expo/vector-icons';
import { useSyncExternalStore } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { sourceStatus } from '../lib/fhir/client';
import { colors, spacing, type } from '../theme';

/** Tells the volunteer, on every screen, when they are not looking at the primary sandbox. */
export function SourceBanner() {
  const source = useSyncExternalStore(sourceStatus.subscribe, sourceStatus.get, sourceStatus.get);
  if (source !== 'sample' && source !== 'forced') return null;

  const message = source === 'forced' ? 'Showing bundled sample data (switch in About)' : 'Sandbox unavailable, showing sample data';
  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
      <Text style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warningMuted,
  },
  text: { ...type.caption, fontWeight: '600', flexShrink: 1, color: colors.warning },
});
