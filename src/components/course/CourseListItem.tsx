import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Course } from '../../types';
import { RatingStars } from '../ui/RatingStars';
import { ProgressBar } from '../ui/ProgressBar';
import { formatPrice, formatDuration, formatDateShort } from '../../utils/formatters';

interface CourseListItemProps {
  course: Course;
  onPress?: () => void;
  progress?: number;
  rightAccessory?: React.ReactNode;
  /** Ordered, waiting for the admin to validate the WhatsApp payment. */
  pending?: boolean;
}

export const CourseListItem: React.FC<CourseListItemProps> = ({ course, onPress, progress, rightAccessory, pending }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.card, opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.985 : 1 }], ...theme.shadow('sm') },
      ]}
    >
      <Image source={{ uri: course.thumbnail }} style={[styles.image, { borderRadius: theme.radius.md }]} />
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>
          {course.title}
        </Text>
        <Text numberOfLines={1} style={[styles.teacher, { color: theme.colors.textSecondary }]}>
          {course.teacherName}
        </Text>
        {pending ? (
          <View style={[styles.statusPill, { backgroundColor: theme.colors.accentLight }]}>
            <Ionicons name="time-outline" size={12} color={theme.colors.warning} />
            <Text style={[styles.statusText, { color: theme.colors.warning }]}>En attente de validation</Text>
          </View>
        ) : course.isLocked && course.unlockDate ? (
          <View style={[styles.statusPill, { backgroundColor: theme.colors.backgroundAlt }]}>
            <Ionicons name="lock-closed" size={11} color={theme.colors.textSecondary} />
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>Dès le {formatDateShort(course.unlockDate)}</Text>
          </View>
        ) : typeof progress === 'number' ? (
          <View style={{ marginTop: 8 }}>
            <ProgressBar progress={progress} height={6} />
            <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>{Math.round(progress * 100)} %</Text>
          </View>
        ) : null}
      </View>
      {rightAccessory ?? (
        <Text style={[styles.price, { color: theme.colors.primary }]}>{course.isFree ? 'Offert' : formatPrice(course.price)}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 10, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  image: { width: 78, height: 78 },
  body: { flex: 1, marginLeft: 12, marginRight: 6 },
  title: { fontSize: 13.5, fontWeight: '700', lineHeight: 18 },
  teacher: { fontSize: 12, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  metaText: { fontSize: 11, marginLeft: 3 },
  metaDot: { fontSize: 11, marginHorizontal: 5 },
  progressLabel: { fontSize: 10.5, marginTop: 4, fontWeight: '600' },
  price: { fontSize: 14, fontWeight: '700', alignSelf: 'flex-start' },
  statusPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginTop: 7 },
  statusText: { fontSize: 10.5, fontWeight: '700' },
});
