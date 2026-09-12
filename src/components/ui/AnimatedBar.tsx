import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';

interface AnimatedBarProps {
  heightPercent: number;
  color: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({ heightPercent, color, delay = 0, style }) => {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(delay, withTiming(heightPercent, { duration: 550, easing: Easing.out(Easing.cubic) }));
  }, [heightPercent, delay, height]);

  const animatedStyle = useAnimatedStyle(() => ({ height: `${height.value}%` }));

  return <Animated.View style={[{ width: '100%', borderRadius: 6, minHeight: 6, backgroundColor: color }, animatedStyle, style]} />;
};
