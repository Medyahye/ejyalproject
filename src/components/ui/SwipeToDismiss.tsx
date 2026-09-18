import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { haptics } from '../../utils/haptics';

export interface SwipeToDismissHandle {
  dismiss: () => void;
}

interface SwipeToDismissProps {
  /** Called once the card has fully animated away — remove it from state here. */
  onDismissed: () => void;
  children: React.ReactNode;
  /** The margin the card normally reserves below it, collapsed smoothly on dismiss. */
  marginBottom?: number;
}

const SWIPE_THRESHOLD = 90;
const FLY_DISTANCE = 600;

export const SwipeToDismiss = forwardRef<SwipeToDismissHandle, SwipeToDismissProps>(
  ({ onDismissed, children, marginBottom = 0 }, ref) => {
    const translateX = useSharedValue(0);
    const cardOpacity = useSharedValue(1);
    const measuredHeight = useSharedValue(0);
    const openness = useSharedValue(1);

    const collapse = () => {
      openness.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) runOnJS(onDismissed)();
      });
    };

    const flyAway = (direction: 1 | -1) => {
      translateX.value = withTiming(direction * FLY_DISTANCE, { duration: 220, easing: Easing.out(Easing.cubic) });
      cardOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) runOnJS(collapse)();
      });
    };

    useImperativeHandle(ref, () => ({
      dismiss: () => flyAway(1),
    }));

    const pan = Gesture.Pan()
      .activeOffsetX([-12, 12])
      .failOffsetY([-14, 14])
      .onUpdate((e) => {
        translateX.value = e.translationX;
        cardOpacity.value = 1 - Math.min(Math.abs(e.translationX) / 260, 0.8);
      })
      .onEnd((e) => {
        const shouldDismiss = Math.abs(e.translationX) > SWIPE_THRESHOLD || Math.abs(e.velocityX) > 800;
        if (shouldDismiss) {
          runOnJS(haptics.tap)();
          runOnJS(flyAway)(e.translationX >= 0 ? 1 : -1);
        } else {
          translateX.value = withSpring(0, { damping: 16 });
          cardOpacity.value = withTiming(1, { duration: 150 });
        }
      });

    const cardStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: cardOpacity.value,
    }));

    const wrapperStyle = useAnimatedStyle(() => ({
      height: measuredHeight.value === 0 ? undefined : measuredHeight.value * openness.value,
      marginBottom: marginBottom * openness.value,
    }));

    return (
      <Animated.View
        style={[styles.wrapper, wrapperStyle]}
        onLayout={(e) => {
          if (measuredHeight.value === 0) measuredHeight.value = e.nativeEvent.layout.height;
        }}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={cardStyle}>{children}</Animated.View>
        </GestureDetector>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden' },
});
