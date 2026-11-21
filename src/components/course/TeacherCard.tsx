import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PublicTeacher } from '../../types';
import { useTheme } from '../../theme';
import { Tag } from '../ui/Tag';

interface TeacherCardProps {
  teacher: PublicTeacher;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** Large photo-first teacher card — the face of the teacher is what students choose on. */
export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onPress, isFavorite, onToggleFavorite, width = 230, height = 290, style }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, height, transform: [{ scale: pressed ? 0.97 : 1 }], ...theme.shadow('md') },
        style,
      ]}
    >
      <Image source={{ uri: teacher.avatar.replace('/150?', '/600?') }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']} locations={[0.35, 0.55, 1]} style={StyleSheet.absoluteFill} />

      <View style={styles.topRow}>
        {teacher.isPromoActive ? (
          <Tag label="Cours offerts" tone="light" />
        ) : (
          <View />
        )}
        {onToggleFavorite && (
          <Pressable onPress={onToggleFavorite} hitSlop={10} style={styles.heart}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#FF6B6B' : '#fff'} />
          </Pressable>
        )}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.name} numberOfLines={1}>{teacher.fullName}</Text>
        <Text style={styles.headline} numberOfLines={2}>{teacher.headline}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={12} color="#FDCB6E" />
            <Text style={styles.statText}>{teacher.rating > 0 ? teacher.rating.toFixed(1) : 'Nouveau'}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={12} color="#fff" />
            <Text style={styles.statText}>{teacher.totalStudents}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="albums" size={12} color="#fff" />
            <Text style={styles.statText}>{teacher.courseCount} packs</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 26, overflow: 'hidden', marginRight: 14, backgroundColor: '#222' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  promo: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#00B894', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  promoText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  heart: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  name: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headline: { color: 'rgba(255,255,255,0.82)', fontSize: 12.5, lineHeight: 17, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  statText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
});
