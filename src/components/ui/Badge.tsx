import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  small?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'primary', small = false }) => {
  const { theme } = useTheme();
  const toneMap: Record<BadgeTone, { bg: string; fg: string }> = {
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    success: { bg: theme.colors.secondarySoft, fg: theme.colors.secondary },
    warning: { bg: theme.colors.accentLight, fg: theme.colors.warning },
    danger: { bg: theme.colors.dangerLight, fg: theme.colors.danger },
    info: { bg: theme.colors.infoLight, fg: theme.colors.info },
    neutral: { bg: theme.colors.backgroundAlt, fg: theme.colors.textSecondary },
  };
  const { bg, fg } = toneMap[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingVertical: small ? 3 : 5, paddingHorizontal: small ? 8 : 10 }]}>
      <Text style={[styles.label, { color: fg, fontSize: small ? 10 : 12 }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { borderRadius: 999, alignSelf: 'flex-start' },
  label: { fontWeight: '700' },
});
