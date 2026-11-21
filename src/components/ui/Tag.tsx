import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type Tone = 'dark' | 'light' | 'primary' | 'accent';

/** Small, sober text label ("Offert", "-20 %"…). No icons, no emojis. */
export const Tag: React.FC<{ label: string; tone?: Tone; style?: StyleProp<ViewStyle> }> = ({ label, tone = 'dark', style }) => {
  const { theme } = useTheme();
  const tones: Record<Tone, { bg: string; fg: string }> = {
    dark: { bg: 'rgba(17,17,22,0.72)', fg: '#FFFFFF' },
    light: { bg: '#FFFFFF', fg: '#111116' },
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDark },
    accent: { bg: theme.colors.text, fg: theme.colors.background },
  };
  const t = tones[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }, style]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
};

/** Plain section title with an optional one-line subtitle and a right-hand action. */
export const SectionTitle: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  tag: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  text: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.2 },
  subtitle: { fontSize: 13.5, marginTop: 3 },
});
