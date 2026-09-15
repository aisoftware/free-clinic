import { Ionicons } from '@expo/vector-icons';
import { useSyncExternalStore } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { sourceStatus } from '../lib/fhir/client';
import { colors, spacing, type } from '../theme';

/** Tells the volunteer, on every screen, when they are not looking at the primary sandbox. */
export function SourceBanner() {
  const source = useSyncExternalStore(sourceStatus.subscribe, sourceStatus.get, sourceStatus.get);
  if (source !== 'sample' && source !== 'hapi') return null;

  const sample = source === 'sample';
  return (
    <View
      style={[styles.banner, sample ? styles.sample : styles.hapi]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={sample ? 'cloud-offline-outline' : 'swap-horizontal-outline'} size={18} color={sample ? colors.warning : colors.info} />
      <Text style={[styles.text, { color: sample ? colors.warning : colors.info }]}>
        {sample ? 'Sandbox unavailable, showing sample data' : 'Primary sandbox unavailable, using the HAPI public server'}
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
  },
  sample: { backgroundColor: colors.warningMuted },
  hapi: { backgroundColor: colors.infoMuted },
  text: { ...type.caption, fontWeight: '600', flexShrink: 1 },
});
