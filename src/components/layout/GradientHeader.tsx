import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface GradientHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  gradient?: readonly [string, string];
  style?: StyleProp<ViewStyle>;
  height?: number;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({ title, subtitle, children, gradient, style, height }) => {
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={gradient ?? theme.colors.gradientPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, height ? { paddingBottom: height } : undefined, style]}
    >
      <SafeAreaView edges={['top']}>
        {title && (
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrap: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
});
