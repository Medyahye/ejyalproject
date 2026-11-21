import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, useWindowDimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { haptics } from '../../utils/haptics';
import { ONBOARDING_SEEN_KEY } from './SplashScreen';


type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

interface Slide {
  key: string;
  kicker: string;
  title: string;
  description: string;
  gradient: readonly [string, string];
  accent: string;
}

const SLIDES: Slide[] = [
  {
    key: 'levels',
    kicker: 'TOUT TON PROGRAMME',
    title: 'Du primaire\nau Bac',
    description: 'Toutes les classes, tous les trimestres.',
    gradient: ['#00C49A', '#00785C'],
    accent: '#FDCB6E',
  },
  {
    key: 'teachers',
    kicker: 'LES MEILLEURS PROFS',
    title: 'Choisis\nton professeur',
    description: 'Les meilleurs profs, au même endroit.',
    gradient: ['#5B4BDB', '#2D1B69'],
    accent: '#FF7675',
  },
  {
    key: 'pay',
    kicker: 'SIMPLE ET SÉCURISÉ',
    title: 'Paie avec\nton téléphone',
    description: 'Bankily, Masrvi, Sedad ou Click.',
    gradient: ['#FF8A5B', '#D6336C'],
    accent: '#FFE66D',
  },
];


/** Gentle up/down float shared by the illustrations' pieces. */
function useFloat(duration = 1800, delay = 0) {
  const v = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      v.value = withRepeat(withSequence(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })), -1);
    }, delay);
    return () => clearTimeout(t);
  }, [v, duration, delay]);
  return v;
}

const Floating: React.FC<{ style?: any; amplitude?: number; duration?: number; delay?: number; children: React.ReactNode }> = ({ style, amplitude = 8, duration, delay, children }) => {
  const f = useFloat(duration, delay);
  const s = useAnimatedStyle(() => ({ transform: [{ translateY: -f.value * amplitude }] }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
};

const Chip: React.FC<{ label: string; icon?: keyof typeof Ionicons.glyphMap; color?: string; bg?: string }> = ({ label, icon, color = '#fff', bg = 'rgba(255,255,255,0.2)' }) => (
  <View style={[styles.chip, { backgroundColor: bg }]}>
    {icon && <Ionicons name={icon} size={14} color={color} />}
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </View>
);

const LevelsArt: React.FC = () => (
  <View style={styles.art}>
    <View style={styles.artCircle} />
    <Floating amplitude={6} style={styles.bigCard}>
      <Text style={styles.bigCode}>7C</Text>
      <Text style={styles.bigLabel}>Bac Série C</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '68%' }]} />
      </View>
      <Text style={styles.bigMeta}>1er trimestre · 68 %</Text>
    </Floating>
    <Floating delay={200} duration={2100} style={[styles.pos, { top: 18, left: 8 }]}>
      <Chip label="1AF" icon="happy" color="#00785C" bg="#FFFFFF" />
    </Floating>
    <Floating delay={500} duration={2300} style={[styles.pos, { top: 40, right: 0 }]}>
      <Chip label="Brevet" icon="school" color="#2C63D6" bg="#FFFFFF" />
    </Floating>
    <Floating delay={300} duration={1900} style={[styles.pos, { bottom: 30, left: 0 }]}>
      <Chip label="Concours" icon="trophy" color="#6C5CE7" bg="#FFFFFF" />
    </Floating>
    <Floating delay={700} duration={2200} style={[styles.pos, { bottom: 10, right: 12 }]}>
      <Chip label="T1 · T2 · T3" icon="calendar" color="#00785C" bg="#FDCB6E" />
    </Floating>
  </View>
);

const TEACHER_FACES = ['https://i.pravatar.cc/300?img=68', 'https://i.pravatar.cc/300?img=32', 'https://i.pravatar.cc/300?img=47'];

const TeachersArt: React.FC = () => (
  <View style={styles.art}>
    <View style={styles.artCircle} />
    <Floating amplitude={5} delay={300} style={[styles.faceCard, { transform: [{ rotate: '-10deg' }], left: 18, top: 50 }]}>
      <Image source={{ uri: TEACHER_FACES[1] }} style={styles.faceImg} />
    </Floating>
    <Floating amplitude={5} delay={600} style={[styles.faceCard, { transform: [{ rotate: '10deg' }], right: 18, top: 50 }]}>
      <Image source={{ uri: TEACHER_FACES[2] }} style={styles.faceImg} />
    </Floating>
    <Floating amplitude={8} style={[styles.faceCard, styles.faceMain]}>
      <Image source={{ uri: TEACHER_FACES[0] }} style={styles.faceImg} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.faceShade}>
        <Text style={styles.faceName}>M. Sidi Ahmed</Text>
        <Text style={styles.faceSub}>4,9/5 · Maths</Text>
      </LinearGradient>
      <View style={styles.heart}>
        <Ionicons name="heart" size={18} color="#FF7675" />
      </View>
    </Floating>
    <Floating delay={400} duration={2200} style={[styles.pos, { bottom: 6, left: 30 }]}>
      <Chip label="Cours offerts" color="#00785C" bg="#FFFFFF" />
    </Floating>
  </View>
);

const PAYMENT_LOGOS = [
  require('../../../assets/payments/bankily.jpg'),
  require('../../../assets/payments/masrvi.png'),
  require('../../../assets/payments/sedad.png'),
  require('../../../assets/payments/click.jpg'),
];

const PayArt: React.FC = () => (
  <View style={styles.art}>
    <View style={styles.artCircle} />
    <Floating amplitude={6} style={styles.phone}>
      <View style={styles.phoneNotch} />
      <View style={styles.phoneCheck}>
        <Ionicons name="checkmark" size={30} color="#fff" />
      </View>
      <Text style={styles.phoneTitle}>Cours activés</Text>
      <Text style={styles.phoneAmount}>3 600 UM</Text>
      <View style={styles.phoneRow}>
        <Ionicons name="shield-checkmark" size={12} color="#00B894" />
        <Text style={styles.phoneMeta}>Protégé · 4 vues/leçon</Text>
      </View>
    </Floating>
    {PAYMENT_LOGOS.map((logo, i) => (
      <Floating
        key={i}
        delay={i * 250}
        duration={2000 + i * 150}
        style={[styles.pos, [{ top: 20, left: 6 }, { top: 60, right: 0 }, { bottom: 50, left: 0 }, { bottom: 14, right: 16 }][i]]}
      >
        <View style={styles.logoTile}>
          <Image source={logo} style={styles.logoImg} resizeMode="contain" />
        </View>
      </Floating>
    ))}
    <Floating delay={900} duration={2400} style={[styles.pos, { top: 4, right: 70 }]}>
      <View style={styles.whatsapp}>
        <Ionicons name="logo-whatsapp" size={24} color="#fff" />
      </View>
    </Floating>
  </View>
);

const ART: Record<string, React.FC> = { levels: LevelsArt, teachers: TeachersArt, pay: PayArt };

const SlideView: React.FC<{ slide: Slide; index: number; x: SharedValue<number>; width: number; topInset: number }> = ({ slide, index, x, width, topInset }) => {
  const Art = ART[slide.key];
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  const artStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      { translateX: interpolate(x.value, range, [width * 0.35, 0, -width * 0.35], Extrapolation.CLAMP) },
      { scale: interpolate(x.value, range, [0.7, 1, 0.7], Extrapolation.CLAMP) },
      { rotate: `${interpolate(x.value, range, [12, 0, -12], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, range, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(x.value, range, [40, 0, 40], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={{ width, flex: 1, paddingTop: topInset + 56 }}>
      <Animated.View style={[styles.artWrap, artStyle]}>
        <Art />
      </Animated.View>
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={[styles.kicker, { color: slide.accent }]}>{slide.kicker}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
};

const BgLayer: React.FC<{ slide: Slide; index: number; x: SharedValue<number>; width: number }> = ({ slide, index, x, width }) => {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [(index - 1) * width, index * width, (index + 1) * width], [0, 1, 0], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient colors={slide.gradient} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
};

const Dot: React.FC<{ index: number; x: SharedValue<number>; width: number }> = ({ index, x, width }) => {
  const style = useAnimatedStyle(() => {
    const range = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(x.value, range, [8, 28, 8], Extrapolation.CLAMP),
      opacity: interpolate(x.value, range, [0.4, 1, 0.4], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const isLast = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  const finish = () => {
    haptics.success();
    AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1').catch(() => {});
    navigation.replace('Login');
  };

  const next = () => {
    haptics.tap();
    if (isLast) finish();
    else listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const buttonStyle = useAnimatedStyle(() => {
    const last = (SLIDES.length - 1) * width;
    return { width: interpolate(x.value, [last - width, last], [64, width - 48], Extrapolation.CLAMP) };
  });
  const labelStyle = useAnimatedStyle(() => {
    const last = (SLIDES.length - 1) * width;
    return { opacity: interpolate(x.value, [last - width * 0.4, last], [0, 1], Extrapolation.CLAMP) };
  });
  const arrowStyle = useAnimatedStyle(() => {
    const last = (SLIDES.length - 1) * width;
    return { opacity: interpolate(x.value, [last - width, last - width * 0.4], [1, 0], Extrapolation.CLAMP) };
  });

  return (
    <View style={{ flex: 1, backgroundColor: SLIDES[0].gradient[1] }}>
      {/* Background gradients crossfade with the swipe. */}
      {SLIDES.map((s, i) => (
        <BgLayer key={s.key} slide={s} index={i} x={x} width={width} />
      ))}

      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <View style={styles.brand}>
          <Ionicons name="school" size={16} color="#fff" />
          <Text style={styles.brandText}>Générations du Futur</Text>
        </View>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12} style={styles.skip}>
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== index) haptics.select();
          setIndex(i);
        }}
        renderItem={({ item, index: i }) => <SlideView slide={item} index={i} x={x} width={width} topInset={insets.top} />}
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <Dot key={s.key} index={i} x={x} width={width} />
          ))}
        </View>
        <Pressable onPress={next} style={({ pressed }) => ({ alignSelf: 'center', transform: [{ scale: pressed ? 0.96 : 1 }] })}>
          <Animated.View style={[styles.cta, buttonStyle]}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaCenter, arrowStyle]}>
              <Ionicons name="arrow-forward" size={26} color="#111" />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.ctaCenter, labelStyle]}>
              <Text style={styles.ctaText}>C'est parti</Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: { position: 'absolute', left: 20, right: 20, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  skip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  skipText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  artWrap: { height: 330, alignItems: 'center', justifyContent: 'center' },
  art: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  artCircle: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.12)' },
  pos: { position: 'absolute' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  chipText: { fontSize: 13, fontWeight: '800' },

  bigCard: { width: 170, backgroundColor: '#fff', borderRadius: 26, padding: 18, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  bigCode: { fontSize: 46, fontWeight: '900', color: '#00785C' },
  bigLabel: { fontSize: 14, fontWeight: '800', color: '#1B1B22', marginTop: -2 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#E6F4EF', marginTop: 14, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: '#00B894' },
  bigMeta: { fontSize: 11.5, color: '#6B6B76', marginTop: 6, fontWeight: '700' },

  faceCard: { position: 'absolute', width: 110, height: 140, borderRadius: 24, overflow: 'hidden', backgroundColor: '#ddd', borderWidth: 3, borderColor: '#fff' },
  faceMain: { width: 150, height: 200, borderRadius: 28, zIndex: 2 },
  faceImg: { width: '100%', height: '100%' },
  faceShade: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingTop: 30 },
  faceName: { color: '#fff', fontWeight: '900', fontSize: 14 },
  faceSub: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 11.5, marginTop: 2 },
  heart: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  phone: { width: 160, height: 220, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', padding: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  phoneNotch: { width: 50, height: 6, borderRadius: 3, backgroundColor: '#E5E5EA', marginBottom: 22 },
  phoneCheck: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' },
  phoneTitle: { fontSize: 14, fontWeight: '800', color: '#1B1B22', marginTop: 12 },
  phoneAmount: { fontSize: 22, fontWeight: '900', color: '#1B1B22', marginTop: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  phoneMeta: { fontSize: 10.5, fontWeight: '700', color: '#00785C' },
  logoTile: { width: 58, height: 44, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  logoImg: { width: '100%', height: '100%' },
  whatsapp: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },

  textBlock: { paddingHorizontal: 28, marginTop: 18 },
  kicker: { fontSize: 12, fontWeight: '900', letterSpacing: 1.4, marginBottom: 10 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 41 },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 23, marginTop: 14 },

  bottom: { paddingHorizontal: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 22 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  cta: { height: 64, borderRadius: 32, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  ctaCenter: { alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 17, fontWeight: '900', color: '#111' },
});
