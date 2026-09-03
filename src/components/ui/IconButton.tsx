import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  variant?: 'filled' | 'ghost' | 'outline';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, size = 40, variant = 'filled', color, style }) => {
  const { theme } = useTheme();
  const bg = variant === 'filled' ? theme.colors.surface : 'transparent';
  const border = variant === 'outline' ? theme.colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: border,
          opacity: pressed ? 0.7 : 1,
          ...theme.shadow(variant === 'filled' ? 'sm' : 'none'),
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.48} color={color ?? theme.colors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
