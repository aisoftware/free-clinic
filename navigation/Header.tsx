import { Ionicons } from '@expo/vector-icons';
import { createContext, ReactNode, useContext } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, touchTarget, type } from '../theme';

/** Height of the header above the current screen, for keyboard avoidance offsets. */
export const HeaderHeightContext = createContext(0);

export function useHeaderHeight() {
  return useContext(HeaderHeightContext);
}

interface HeaderProps {
  title: string;
  right?: ReactNode;
  back?: { label: string; onPress: () => void };
  onLayout?: (e: LayoutChangeEvent) => void;
}

export function Header({ title, right, back, onLayout }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]} onLayout={onLayout}>
      <View style={styles.row}>
        {back ? (
          <Pressable
            onPress={back.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${back.label}, back`}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </Pressable>
        ) : null}
        <Text style={[styles.title, !back && styles.titleInset]} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center' },
  back: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.xs },
  title: { ...type.heading, color: colors.text, flex: 1 },
  titleInset: { marginLeft: spacing.lg },
  right: { marginLeft: spacing.sm },
});
