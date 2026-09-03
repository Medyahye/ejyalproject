import { palette } from './palette';

export interface ThemeColors {
  mode: 'light' | 'dark';
  background: string;
  backgroundAlt: string;
  surface: string;
  card: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  secondary: string;
  secondaryLight: string;
  secondarySoft: string;
  accent: string;
  accentLight: string;
  info: string;
  infoLight: string;
  success: string;
  warning: string;
  danger: string;
  dangerLight: string;
  overlay: string;
  shadow: string;
  gradientPrimary: readonly [string, string];
  gradientSecondary: readonly [string, string];
  gradientSunset: readonly [string, string];
  gradientOcean: readonly [string, string];
}

export const lightColors: ThemeColors = {
  mode: 'light',
  background: palette.gray25,
  backgroundAlt: palette.gray50,
  surface: palette.white,
  card: palette.white,
  border: palette.gray100,
  borderStrong: palette.gray200,

  text: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray400,
  textInverse: palette.white,

  primary: palette.violet500,
  primaryDark: palette.violet700,
  primaryLight: palette.violet100,
  primarySoft: palette.violet50,

  secondary: palette.green500,
  secondaryLight: palette.green100,
  secondarySoft: palette.green50,

  accent: palette.gold500,
  accentLight: palette.gold300,

  info: palette.blue500,
  infoLight: palette.blue400,

  success: palette.green500,
  warning: palette.gold600,
  danger: palette.red500,
  dangerLight: palette.red300,

  overlay: 'rgba(14, 14, 19, 0.55)',
  shadow: '#1B1B22',

  gradientPrimary: [palette.violet500, palette.violet700] as const,
  gradientSecondary: [palette.green500, palette.green700] as const,
  gradientSunset: [palette.gold500, palette.red500] as const,
  gradientOcean: [palette.blue500, palette.violet600] as const,
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  background: palette.gray900,
  backgroundAlt: palette.black,
  surface: palette.gray800,
  card: palette.gray800,
  border: palette.gray700,
  borderStrong: palette.gray600,

  text: palette.gray25,
  textSecondary: palette.gray300,
  textMuted: palette.gray500,
  textInverse: palette.gray900,

  primary: palette.violet400,
  primaryDark: palette.violet300,
  primaryLight: palette.violet800,
  primarySoft: palette.violet900,

  secondary: palette.green300,
  secondaryLight: palette.green700,
  secondarySoft: palette.violet900,

  accent: palette.gold300,
  accentLight: palette.gold500,

  info: palette.blue400,
  infoLight: palette.blue500,

  success: palette.green300,
  warning: palette.gold500,
  danger: palette.red300,
  dangerLight: palette.red600,

  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: '#000000',

  gradientPrimary: [palette.violet400, palette.violet600] as const,
  gradientSecondary: [palette.green300, palette.green600] as const,
  gradientSunset: [palette.gold500, palette.red500] as const,
  gradientOcean: [palette.blue400, palette.violet500] as const,
};
