import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface SkeletonBlockProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ width = '100%', height = 16, radius = 8, style }) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.colors.border },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const CourseCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <SkeletonBlock height={110} radius={theme.radius.md} />
      <View style={{ padding: 10 }}>
        <SkeletonBlock height={13} width="90%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={13} width="60%" style={{ marginBottom: 10 }} />
        <SkeletonBlock height={11} width="40%" />
      </View>
    </View>
  );
};

export const ListRowSkeleton: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.colors.card }]}>
      <SkeletonBlock width={70} height={70} radius={theme.radius.md} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonBlock height={13} width="85%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={13} width="55%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={11} width="30%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { width: 180, borderRadius: 16, overflow: 'hidden', marginRight: 14 },
  row: { flexDirection: 'row', padding: 12, borderRadius: 16, marginBottom: 12 },
});
