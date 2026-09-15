import { useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Stroke, strokesToPath } from '../lib/fhir/intake';
import { colors, radius, spacing, type } from '../theme';
import { Button } from './Button';

interface Props {
  strokes: Stroke[];
  onChange: (strokes: Stroke[], size: { width: number; height: number }) => void;
  /** Lets the parent lock scrolling while a finger is on the pad. */
  onSigningChange: (signing: boolean) => void;
  placeholder: string;
  clearLabel: string;
  accessibilityLabel: string;
}

const HEIGHT = 160;

export function SignaturePad({ strokes, onChange, onSigningChange, placeholder, clearLabel, accessibilityLabel }: Props) {
  const [live, setLive] = useState<Stroke | null>(null);
  const size = useRef({ width: 0, height: HEIGHT });
  const current = useRef<Stroke | null>(null);
  // Handlers are created once; refs keep them reading the latest props.
  const latest = useRef({ strokes, onChange, onSigningChange });
  latest.current = { strokes, onChange, onSigningChange };

  const responder = useMemo(() => {
    const point = (e: GestureResponderEvent) => ({
      x: Math.max(0, Math.min(size.current.width, e.nativeEvent.locationX)),
      y: Math.max(0, Math.min(size.current.height, e.nativeEvent.locationY)),
    });
    const finish = () => {
      const stroke = current.current;
      current.current = null;
      setLive(null);
      latest.current.onSigningChange(false);
      if (stroke?.length) latest.current.onChange([...latest.current.strokes, stroke], size.current);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      // Do not let a parent ScrollView take the gesture mid-signature.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e) => {
        latest.current.onSigningChange(true);
        current.current = [point(e)];
        setLive(current.current);
      },
      onPanResponderMove: (e) => {
        if (!current.current) return;
        current.current = [...current.current, point(e)];
        setLive(current.current);
      },
      onPanResponderRelease: finish,
      onPanResponderTerminate: finish,
    });
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    size.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
  };

  const path = strokesToPath(live ? [...strokes, live] : strokes);
  const empty = strokes.length === 0 && !live;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.pad}
        onLayout={onLayout}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Draw a signature inside this box"
        {...responder.panHandlers}
      >
        {empty ? (
          <Text style={styles.placeholder}>{placeholder}</Text>
        ) : null}
        <View style={styles.baseline} />
        {/* The drawing layer ignores touches so event coordinates stay relative to the pad itself. */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {path ? <Path d={path} fill="none" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /> : null}
        </Svg>
      </View>
      <View style={styles.actions}>
        <Button
          label={clearLabel}
          variant="ghost"
          icon="trash-outline"
          disabled={strokes.length === 0}
          onPress={() => onChange([], size.current)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  pad: {
    height: HEIGHT,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    // Mobile browsers would otherwise scroll the page instead of drawing.
    ...Platform.select({ web: { touchAction: 'none', cursor: 'crosshair', userSelect: 'none' } as object, default: {} }),
  },
  placeholder: { ...type.body, color: colors.textMuted, position: 'absolute', left: spacing.lg, top: spacing.lg, pointerEvents: 'none' },
  baseline: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 36,
    height: 1,
    backgroundColor: colors.border,
    pointerEvents: 'none',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});
