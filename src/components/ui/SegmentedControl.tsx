import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { haptics } from '../../utils/haptics';

interface SegmentedControlProps<T extends string> {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { theme } = useTheme();
  const [containerWidth, setContainerWidth] = React.useState(0);
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  const segmentWidth = containerWidth / options.length;
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(index * segmentWidth, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [index, segmentWidth, translateX]);

  const highlightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={[styles.track, { backgroundColor: theme.colors.backgroundAlt }]}>
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.highlight,
            highlightStyle,
            { width: segmentWidth, backgroundColor: theme.colors.card, ...theme.shadow('sm') },
          ]}
        />
      )}
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            onPress={() => {
              if (opt.id !== value) haptics.select();
              onChange(opt.id);
            }}
            style={styles.segment}
          >
            <Text numberOfLines={1} style={[styles.label, { color: selected ? theme.colors.text : theme.colors.textMuted, fontWeight: selected ? '800' : '600' }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 14, padding: 4, position: 'relative', width: '100%', alignSelf: 'stretch' },
  highlight: { position: 'absolute', top: 4, bottom: 4, left: 0, borderRadius: 11 },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  label: { fontSize: 12.5 },
});
