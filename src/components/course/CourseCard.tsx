import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Course } from '../../types';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { formatPrice } from '../../utils/formatters';

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  width?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, onToggleFavorite, isFavorite, width = 190 }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, backgroundColor: theme.colors.card, opacity: pressed ? 0.95 : 1, ...theme.shadow('sm') },
      ]}
    >
      <View>
        <Image source={{ uri: course.thumbnail }} style={styles.image} />
        {(course.isBestseller || course.isFeatured) && (
          <View style={styles.badgeOverlay}>
            <Badge label={course.isBestseller ? 'Best-seller' : 'À la une'} tone={course.isBestseller ? 'warning' : 'primary'} small />
          </View>
        )}
        {onToggleFavorite && (
          <Pressable onPress={onToggleFavorite} hitSlop={8} style={styles.favBtn}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={isFavorite ? theme.colors.danger : '#fff'} />
          </Pressable>
        )}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.category, { color: theme.colors.primary }]}>
          {course.categoryName}
        </Text>
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>
          {course.title}
        </Text>
        <RatingStars rating={course.rating} size={11} showValue={false} count={course.ratingCount} />
        <View style={styles.footerRow}>
          <Text style={[styles.price, { color: theme.colors.text }]}>{formatPrice(course.price)}</Text>
          {course.originalPrice && (
            <Text style={[styles.oldPrice, { color: theme.colors.textMuted }]}>{formatPrice(course.originalPrice)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden', marginRight: 14 },
  image: { width: '100%', height: 104 },
  badgeOverlay: { position: 'absolute', top: 8, left: 8 },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 10 },
  category: { fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.3 },
  title: { fontSize: 13, fontWeight: '700', lineHeight: 17, marginBottom: 6, minHeight: 34 },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 14, fontWeight: '800', marginRight: 6 },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
});
