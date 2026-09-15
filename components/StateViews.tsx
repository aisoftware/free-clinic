import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import { Button } from './Button';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function SkeletonRows({ count = 6 }: { count?: number }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.5, duration: 650, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View accessibilityLabel="Loading" accessibilityRole="progressbar" style={styles.skeletonWrap}>
      {Array.from({ length: count }, (_, i) => (
        <Animated.View key={i} style={[styles.skeletonRow, { opacity: pulse }]}>
          <View style={[styles.bar, { width: '55%' }]} />
          <View style={[styles.bar, styles.barThin, { width: '80%' }]} />
        </Animated.View>
      ))}
    </View>
  );
}

interface MessageProps {
  icon: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
}

export function MessageView({ icon, title, body, actionLabel, onAction, tone = 'neutral' }: MessageProps) {
  return (
    <View style={styles.message} accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <Ionicons name={icon} size={36} color={tone === 'danger' ? colors.danger : colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="secondary" icon="refresh" /> : null}
    </View>
  );
}

export function EmptyState(props: Omit<MessageProps, 'tone' | 'icon'> & { icon?: IconName }) {
  return <MessageView icon={props.icon ?? 'file-tray-outline'} {...props} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <MessageView
      icon="alert-circle-outline"
      tone="danger"
      title="Could not load this data"
      body={message}
      actionLabel="Try again"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  skeletonWrap: { padding: spacing.lg, gap: spacing.md },
  skeletonRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bar: { height: 14, borderRadius: radius.sm, backgroundColor: colors.skeleton },
  barThin: { height: 10 },
  message: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  title: { ...type.heading, color: colors.text, textAlign: 'center' },
  body: { ...type.body, color: colors.textMuted, textAlign: 'center' },
});
