import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const typography = {
  fontFamily,
  fontFamilyMedium,
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h1: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '700' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  body: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 21, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  captionMedium: { fontSize: 12, lineHeight: 18, fontWeight: '700' as const },
  tiny: { fontSize: 10, lineHeight: 14, fontWeight: '600' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
};
