import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Course } from '../../types';
import { formatPrice, formatDateShort } from '../../utils/formatters';
import { Tag } from '../ui/Tag';

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  width?: number;
}

/** Pack card: cover, title, teacher and price — only what helps choosing. */
export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, onToggleFavorite, isFavorite, width = 260 }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          backgroundColor: theme.colors.card,
          transform: [{ scale: pressed ? 0.975 : 1 }],
          ...theme.shadow('sm'),
        },
      ]}
    >
      <View>
        <Image source={{ uri: course.thumbnail }} style={styles.image} />
        <View style={styles.topRow}>
          <View style={styles.pillRow}>
            {course.isFree && <Tag label="Offert" tone="light" />}
            {course.isLocked && course.unlockDate && (
              <View style={[styles.pill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                <Ionicons name="lock-closed" size={11} color="#fff" />
                <Text style={styles.pillText}>{formatDateShort(course.unlockDate)}</Text>
              </View>
            )}
          </View>
          {onToggleFavorite && (
            <Pressable onPress={onToggleFavorite} hitSlop={8} style={styles.favBtn}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={17} color={isFavorite ? theme.colors.danger : '#fff'} />
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>{course.title}</Text>
        <View style={styles.footerRow}>
          <Image source={{ uri: course.teacherAvatar }} style={styles.teacherDot} />
          <Text numberOfLines={1} style={[styles.teacher, { color: theme.colors.textSecondary }]}>{course.teacherName}</Text>
          <Text style={[styles.price, { color: course.isFree ? theme.colors.primary : theme.colors.text }]}>
            {course.isFree ? 'Offert' : formatPrice(course.price)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 22, overflow: 'hidden', marginRight: 14 },
  image: { width: '100%', height: 150 },
  topRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pillRow: { flexDirection: 'row', gap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { color: '#fff', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  bottomOverlay: { position: 'absolute', left: 10, bottom: 10, flexDirection: 'row', gap: 6 },
  favBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  teacherDot: { width: 22, height: 22, borderRadius: 11, marginRight: 6 },
  body: { padding: 14, paddingTop: 12 },
  title: { fontSize: 15, fontWeight: '800', lineHeight: 20, minHeight: 40 },
  teacher: { flex: 1, fontSize: 12.5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  price: { fontSize: 15.5, fontWeight: '800' },
  oldPrice: { fontSize: 11.5, textDecorationLine: 'line-through' },
});
