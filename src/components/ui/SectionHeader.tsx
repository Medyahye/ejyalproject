import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actionLabel = 'Voir tout', onAction }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {onAction && (
        <Pressable onPress={onAction} style={styles.actionRow} hitSlop={8}>
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  title: { fontSize: 19, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 3 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '700', marginRight: 2 },
});
