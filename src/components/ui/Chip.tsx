import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { haptics } from '../../utils/haptics';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, icon }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundAlt,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          ...(selected ? theme.shadow('sm') : null),
        },
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={14} color={selected ? theme.colors.textInverse : theme.colors.textSecondary} style={{ marginRight: 6 }} />
      )}
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, { color: selected ? theme.colors.textInverse : theme.colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 10,
  },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
});
