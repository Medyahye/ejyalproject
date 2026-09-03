import React from 'react';
import { View, StyleProp, ViewStyle, Pressable } from 'react-native';
import { useTheme, ShadowLevel } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: ShadowLevel;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevation = 'sm', padded = true }) => {
  const { theme } = useTheme();
  const baseStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      padding: padded ? theme.spacing.md : 0,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.colors.border,
      ...theme.shadow(elevation),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
};
