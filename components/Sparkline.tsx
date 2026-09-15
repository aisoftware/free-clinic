import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors } from '../theme';

interface SparklineProps {
  values: number[];
  /** Optional second series drawn on the same scale (diastolic pressure). */
  values2?: (number | undefined)[];
  width?: number;
  height?: number;
  label: string;
}

export function Sparkline({ values, values2, width = 96, height = 32, label }: SparklineProps) {
  const all = [...values, ...(values2 ?? []).filter((v): v is number => v !== undefined)];
  if (values.length < 2 || all.length === 0) return null;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = 4;
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (width - pad * 2)) / (values.length - 1);
  const y = (v: number) => height - pad - ((v - min) * (height - pad * 2)) / span;
  const points = (series: number[]) => series.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const second = values2?.every((v) => v !== undefined) ? (values2 as number[]) : null;
  const lastIndex = values.length - 1;

  return (
    <View accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={width} height={height}>
        {second ? <Polyline points={points(second)} fill="none" stroke={colors.info} strokeWidth={2} strokeLinejoin="round" /> : null}
        <Polyline points={points(values)} fill="none" stroke={colors.primary} strokeWidth={2} strokeLinejoin="round" />
        <Circle cx={x(lastIndex)} cy={y(values[lastIndex])} r={3} fill={colors.primary} />
        {second ? <Circle cx={x(lastIndex)} cy={y(second[lastIndex])} r={3} fill={colors.info} /> : null}
      </Svg>
    </View>
  );
}
