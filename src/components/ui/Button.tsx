import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const paddingV = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  const content = (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.textInverse} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={fontSize + 3}
              color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.textInverse}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.label,
              { fontSize, color: variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.textInverse },
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={fontSize + 3}
              color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.textInverse}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </View>
  );

  const baseStyle: StyleProp<ViewStyle> = [
    styles.base,
    { paddingVertical: paddingV, opacity: isDisabled ? 0.55 : 1, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
    variant === 'outline' && { borderWidth: 1.5, borderColor: theme.colors.primary, backgroundColor: 'transparent' },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    variant === 'danger' && { backgroundColor: theme.colors.danger },
    variant === 'secondary' && { backgroundColor: theme.colors.secondary },
    style,
  ];

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, fullWidth && { alignSelf: 'stretch' }]}>
        <LinearGradient
          colors={theme.colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, { paddingVertical: paddingV, opacity: isDisabled ? 0.55 : 1 }, style]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.85 : isDisabled ? 0.55 : 1 }]}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
