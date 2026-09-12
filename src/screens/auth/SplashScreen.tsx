import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const Orb: React.FC<{ size: number; style: any; delay: number }> = ({ size, style, delay }) => {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })), -1, false)
    );
  }, [delay, float]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -float.value * 18 }, { scale: 1 + float.value * 0.08 }],
    opacity: 0.14 + float.value * 0.1,
  }));

  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff', position: 'absolute' }, style, animatedStyle]} />;
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const bob = useSharedValue(0.3);

  useEffect(() => {
    bob.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 380 })), -1, false));
  }, [delay, bob]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: bob.value, transform: [{ scale: 0.7 + bob.value * 0.4 }] }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const glow = useSharedValue(0.5);
  const shimmer = useSharedValue(-1);
  const nameOpacity = useSharedValue(0);
  const nameY = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(8);

  useEffect(() => {
    scale.value = withSequence(withTiming(1.1, { duration: 550, easing: Easing.out(Easing.back(1.6)) }), withTiming(1, { duration: 200 }));
    opacity.value = withTiming(1, { duration: 450 });
    glow.value = withDelay(200, withRepeat(withSequence(withTiming(1, { duration: 1100 }), withTiming(0.5, { duration: 1100 })), -1, true));
    shimmer.value = withDelay(700, withRepeat(withSequence(withTiming(1.4, { duration: 900, easing: Easing.inOut(Easing.cubic) }), withDelay(900, withTiming(-1, { duration: 0 }))), -1, false));

    nameOpacity.value = withDelay(320, withTiming(1, { duration: 400 }));
    nameY.value = withDelay(320, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(520, withTiming(1, { duration: 400 }));
    taglineY.value = withDelay(520, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    const timer = setTimeout(() => navigation.replace('Onboarding'), 2300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.5, transform: [{ scale: 1 + glow.value * 0.25 }] }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmer.value * 120 }, { rotate: '20deg' }] }));
  const nameStyle = useAnimatedStyle(() => ({ opacity: nameOpacity.value, transform: [{ translateY: nameY.value }] }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value, transform: [{ translateY: taglineY.value }] }));

  return (
    <LinearGradient colors={theme.colors.gradientPrimary} style={styles.container} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}>
      <Orb size={140} style={{ top: 60, left: -40 }} delay={0} />
      <Orb size={90} style={{ bottom: 120, right: -20 }} delay={500} />
      <Orb size={60} style={{ top: 140, right: 40 }} delay={1000} />

      <View style={styles.logoWrap}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={[styles.logoCircle, logoStyle]}>
          <Ionicons name="school" size={48} color={theme.colors.primary} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
        <Animated.Text style={[styles.appName, nameStyle]}>EduConnect</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>Apprenez. Progressez. Réussissez.</Animated.Text>
      </View>

      <View style={styles.dotsRow}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoWrap: { alignItems: 'center' },
  glow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#fff', top: -19 },
  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    width: 30,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.9)',
    opacity: 0.35,
  },
  appName: { fontSize: 27, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  dotsRow: { position: 'absolute', bottom: 64, flexDirection: 'row', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
});
