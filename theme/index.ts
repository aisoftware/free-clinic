import { Platform, TextStyle } from 'react-native';

// Contrast: every text/background pair below meets WCAG AA (4.5:1) for body text.
export const colors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F6',
  border: '#D5DCE4',
  text: '#15202B',
  textMuted: '#4A5968',
  textInverse: '#FFFFFF',
  primary: '#0B5C8C',
  primaryMuted: '#DCEBF5',
  success: '#1E6B3A',
  successMuted: '#DDF1E3',
  warning: '#8A5300',
  warningMuted: '#FBEBD0',
  danger: '#A61B1B',
  dangerMuted: '#F8DEDE',
  info: '#4B3F9E',
  infoMuted: '#E6E3F7',
  skeleton: '#E1E6EC',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

// Apple HIG and WCAG 2.5.8 minimum target size.
export const touchTarget = 44;

const family = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

type TypeStyle = 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label' | 'mono';

export const type: Record<TypeStyle, TextStyle> = {
  title: { fontFamily: family, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontFamily: family, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontFamily: family, fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontFamily: family, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontFamily: family, fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.4 },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    lineHeight: 17,
  },
};

export const shadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(21, 32, 43, 0.08)' },
  default: {
    shadowColor: '#15202B',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
