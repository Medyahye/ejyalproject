import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PublicTeacher } from '../../types';
import { haptics } from '../../utils/haptics';
import { Tag } from '../ui/Tag';

/** Ring colors cycle so each teacher has their own vibe. */
const RINGS: Array<readonly [string, string, string]> = [
  ['#00C49A', '#FDCB6E', '#00785C'],
  ['#6C5CE7', '#FF7675', '#4432B0'],
  ['#FF8A5B', '#FDCB6E', '#D6336C'],
  ['#3D7FF7', '#55EFC4', '#2C63D6'],
];

interface Props {
  teachers: PublicTeacher[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onPress: (id: string) => void;
}

const SPACING = 14;

const Square: React.FC<{
  teacher: PublicTeacher;
  index: number;
  x: SharedValue<number>;
  size: number;
  shine: SharedValue<number>;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}> = ({ teacher, index, x, size, shine, favorite, onPress, onToggleFavorite }) => {
  const step = size + SPACING;
  const ring = RINGS[index % RINGS.length];

  // The square in focus grows, the neighbours shrink and tilt away (coverflow).
  const cardStyle = useAnimatedStyle(() => {
    const pos = x.value / step;
    const range = [index - 1, index, index + 1];
    return {
      transform: [
        { perspective: 800 },
        { scale: interpolate(pos, range, [0.84, 1, 0.84], Extrapolation.CLAMP) },
        { rotateY: `${interpolate(pos, range, [18, 0, -18], Extrapolation.CLAMP)}deg` },
        { translateY: interpolate(pos, range, [10, 0, 10], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(pos, [index - 2, index, index + 2], [0.55, 1, 0.55], Extrapolation.CLAMP),
    };
  });
  // Photo moves slower than the card: parallax.
  const photoStyle = useAnimatedStyle(() => {
    const pos = x.value / step;
    return { transform: [{ translateX: interpolate(pos, [index - 1, index, index + 1], [-24, 0, 24], Extrapolation.CLAMP) }, { scale: 1.2 }] };
  });
  const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shine.value * size * 2.2 - size }, { rotate: '25deg' }] }));

  return (
    <Animated.View style={[{ width: size, height: size, marginRight: SPACING }, cardStyle]}>
      <Pressable
        onPress={() => {
          haptics.tap();
          onPress();
        }}
        style={({ pressed }) => [{ flex: 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
      >
        <LinearGradient colors={ring} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ring}>
          <View style={styles.inner}>
            <Animated.Image source={{ uri: teacher.avatar.replace('/150?', '/600?') }} style={[StyleSheet.absoluteFill, photoStyle]} />
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.82)']} locations={[0.3, 0.5, 1]} style={StyleSheet.absoluteFill} />
            <Animated.View pointerEvents="none" style={[styles.shine, { height: size * 2 }, shineStyle]} />

            <View style={styles.topRow}>
              <View style={styles.rating}>
                <Ionicons name="star" size={11} color="#FDCB6E" />
                <Text style={styles.ratingText}>{teacher.rating > 0 ? teacher.rating.toFixed(1) : 'Nouveau'}</Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={(e) => {
                  e.stopPropagation();
                  haptics.success();
                  onToggleFavorite();
                }}
                style={styles.heart}
              >
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={16} color={favorite ? '#FF7675' : '#fff'} />
              </Pressable>
            </View>

            {teacher.isPromoActive && (
              <Tag label="Cours offerts" tone="light" style={styles.promo} />
            )}

            <View style={styles.bottom}>
              <Text numberOfLines={1} style={styles.name}>{teacher.fullName}</Text>
              <Text numberOfLines={1} style={styles.meta}>
                {teacher.specialties[0] ?? 'Professeur'} · {teacher.courseCount} packs
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

/** Horizontal coverflow of big square teacher photos, auto-playing until touched. */
export const TeacherSquares: React.FC<Props> = ({ teachers, isFavorite, onToggleFavorite, onPress }) => {
  const { width } = useWindowDimensions();
  const size = Math.min(210, width * 0.52);
  const step = size + SPACING;
  const sidePadding = (width - size) / 2;
  const x = useSharedValue(0);
  const shine = useSharedValue(0);
  const listRef = useRef<FlatList<PublicTeacher>>(null);
  const [active, setActive] = useState(0);
  const touched = useRef(false);

  useEffect(() => {
    shine.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [shine]);

  // Auto-play: gently moves to the next teacher every 3.5 s until the student touches the list.
  useEffect(() => {
    if (teachers.length < 2) return;
    const t = setInterval(() => {
      if (touched.current) return;
      setActive((a) => {
        const next = (a + 1) % teachers.length;
        listRef.current?.scrollToOffset({ offset: next * step, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [teachers.length, step]);

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  if (teachers.length === 0) return null;

  return (
    <View>
      <Animated.FlatList
        ref={listRef}
        data={teachers}
        keyExtractor={(t) => t.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          touched.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / step);
          if (i !== active) haptics.select();
          setActive(i);
        }}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: sidePadding, paddingVertical: 10 }}
        renderItem={({ item, index }) => (
          <Square
            teacher={item}
            index={index}
            x={x}
            size={size}
            shine={shine}
            favorite={isFavorite(item.id)}
            onPress={() => onPress(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
          />
        )}
      />
      <View style={styles.dots}>
        {teachers.map((t, i) => (
          <Dot key={t.id} index={i} x={x} step={step} />
        ))}
      </View>
    </View>
  );
};

const Dot: React.FC<{ index: number; x: SharedValue<number>; step: number }> = ({ index, x, step }) => {
  const style = useAnimatedStyle(() => {
    const pos = x.value / step;
    return {
      width: interpolate(pos, [index - 1, index, index + 1], [6, 22, 6], Extrapolation.CLAMP),
      opacity: interpolate(pos, [index - 1, index, index + 1], [0.3, 1, 0.3], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  ring: { flex: 1, borderRadius: 34, padding: 3.5, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  inner: { flex: 1, borderRadius: 31, overflow: 'hidden', backgroundColor: '#222' },
  shine: { position: 'absolute', top: -60, width: 40, backgroundColor: 'rgba(255,255,255,0.18)' },
  topRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heart: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  promo: { position: 'absolute', bottom: 62, left: 10 },
  bottom: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: '900' },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: '700', marginTop: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 6 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#00B894' },
});
