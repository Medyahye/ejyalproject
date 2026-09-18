import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const slides = [
  {
    icon: 'rocket-outline' as const,
    title: 'Apprenez à votre rythme',
    description: 'Des centaines de cours vidéo créés par des experts, accessibles à tout moment, où que vous soyez.',
    gradient: ['#5FE0B3', '#00B894'] as const,
  },
  {
    icon: 'ribbon-outline' as const,
    title: 'Progressez avec des experts',
    description: 'Suivez votre progression, obtenez des supports PDF et échangez en direct avec vos formateurs.',
    gradient: ['#00B894', '#009975'] as const,
  },
  {
    icon: 'trending-up-outline' as const,
    title: 'Devenez formateur',
    description: 'Partagez votre savoir, vendez vos propres cours et suivez vos revenus en temps réel.',
    gradient: ['#00B894', '#00785C'] as const,
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  const goNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1 }}>
            <LinearGradient colors={item.gradient} style={styles.iconSection}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={64} color="#fff" />
              </View>
            </LinearGradient>
            <View style={styles.textSection}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 24 : 8,
                  backgroundColor: i === index ? theme.colors.primary : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Button label={index === slides.length - 1 ? 'Commencer' : 'Suivant'} onPress={goNext} icon="arrow-forward" iconPosition="right" />
        {index < slides.length - 1 && (
          <Text onPress={() => navigation.replace('Login')} style={[styles.skip, { color: theme.colors.textMuted }]}>
            Passer
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconSection: { height: '52%', alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  iconCircle: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  textSection: { paddingHorizontal: 32, paddingTop: 36 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bottomSection: { paddingHorizontal: 28, paddingBottom: 28 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  skip: { textAlign: 'center', marginTop: 16, fontSize: 13, fontWeight: '600' },
});
