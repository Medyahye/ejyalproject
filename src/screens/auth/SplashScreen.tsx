import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const ONBOARDING_SEEN_KEY = 'onboarding_seen_v2';

const SUBJECTS: Array<{ icon: keyof typeof Ionicons.glyphMap; angle: number; radius: number; color: string }> = [
  { icon: 'calculator', angle: -90, radius: 120, color: '#FDCB6E' },
  { icon: 'flask', angle: -30, radius: 132, color: '#74B9FF' },
  { icon: 'book', angle: 30, radius: 120, color: '#FF7675' },
  { icon: 'earth', angle: 90, radius: 132, color: '#A29BFE' },
  { icon: 'language', angle: 150, radius: 120, color: '#55EFC4' },
  { icon: 'trophy', angle: 210, radius: 132, color: '#FAB1A0' },
];

/** A subject bubble that pops out of the logo and then floats around it. */
const SubjectBubble: React.FC<{ index: number; icon: keyof typeof Ionicons.glyphMap; angle: number; radius: number; color: string }> = ({
  index,
  icon,
  angle,
  radius,
  color,
}) => {
  const out = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    out.value = withDelay(500 + index * 90, withSpring(1, { damping: 11, stiffness: 120 }));
    float.value = withDelay(
      900 + index * 120,
      withRepeat(withSequence(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })), -1)
    );
  }, [index, out, float]);

  const rad = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: out.value,
    transform: [
      { translateX: Math.cos(rad) * radius * out.value },
      { translateY: Math.sin(rad) * radius * out.value - float.value * 8 },
      { scale: interpolate(out.value, [0, 1], [0.2, 1]) },
      { rotate: `${(float.value - 0.5) * 12}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.bubble, style]}>
      <Ionicons name={icon} size={22} color={color} />
    </Animated.View>
  );
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const logoScale = useSharedValue(0);
  const ring = useSharedValue(0);
  const title = useSharedValue(0);
  const arabic = useSharedValue(0);
  const tagline = useSharedValue(0);
  const progress = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    let destination: 'Onboarding' | 'Login' = 'Onboarding';
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY)
      .then((v) => {
        if (v) destination = 'Login';
      })
      .catch(() => {});

    logoScale.value = withSpring(1, { damping: 9, stiffness: 110 });
    ring.value = withDelay(300, withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false));
    title.value = withDelay(700, withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }));
    arabic.value = withDelay(900, withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }));
    tagline.value = withDelay(1150, withTiming(1, { duration: 500 }));
    progress.value = withDelay(400, withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.cubic) }));
    exit.value = withDelay(2650, withTiming(1, { duration: 300 }));

    const timer = setTimeout(() => navigation.replace(destination), 2950);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }, { rotate: `${(1 - logoScale.value) * -40}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - ring.value), transform: [{ scale: 1 + ring.value * 1.2 }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: title.value, transform: [{ translateY: (1 - title.value) * 18 }] }));
  const arabicStyle = useAnimatedStyle(() => ({ opacity: arabic.value * 0.9, transform: [{ translateY: (1 - arabic.value) * 14 }] }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: tagline.value }));
  const barStyle = useAnimatedStyle(() => ({ width: progress.value * (width * 0.42) }));
  const exitStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.value, transform: [{ scale: 1 + exit.value * 0.06 }] }));

  return (
    <LinearGradient colors={['#00C49A', '#00785C', '#04342C']} locations={[0, 0.55, 1]} style={styles.container} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      <View style={[styles.blob, { top: -80, left: -60, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
      <View style={[styles.blob, { bottom: -100, right: -80, width: 300, height: 300, backgroundColor: 'rgba(253,203,110,0.10)' }]} />

      <Animated.View style={[styles.center, exitStyle]}>
        <View style={styles.stage}>
          {SUBJECTS.map((s, i) => (
            <SubjectBubble key={s.icon} index={i} {...s} />
          ))}
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={[styles.logo, logoStyle]}>
            <LinearGradient colors={['#FFFFFF', '#E6FFF7']} style={styles.logoInner}>
              <Ionicons name="school" size={50} color="#00A07D" />
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.appName, titleStyle]}>Générations du Futur</Animated.Text>
        <Animated.Text style={[styles.arabic, arabicStyle]}>أجيال المستقبل</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>Du primaire au Bac, avec les meilleurs profs</Animated.Text>
      </Animated.View>

      <View style={styles.bottom}>
        <View style={[styles.track, { width: width * 0.42 }]}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', width: 260, height: 260, borderRadius: 130 },
  center: { alignItems: 'center' },
  stage: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  bubble: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { position: 'absolute', width: 110, height: 110, borderRadius: 36, borderWidth: 3, borderColor: '#fff' },
  logo: { width: 104, height: 104, borderRadius: 34, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  logoInner: { flex: 1, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 0.2, textAlign: 'center' },
  arabic: { fontSize: 22, fontWeight: '700', color: '#FDCB6E', marginTop: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 12, fontWeight: '600' },
  bottom: { position: 'absolute', bottom: 70, alignItems: 'center' },
  track: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  bar: { height: 5, borderRadius: 3, backgroundColor: '#FDCB6E' },
});
