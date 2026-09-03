import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Review } from '../../types';
import { Avatar } from '../ui/Avatar';
import { RatingStars } from '../ui/RatingStars';
import { formatDateShort } from '../../utils/formatters';

export const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrap, { borderBottomColor: theme.colors.border }]}>
      <Avatar uri={review.studentAvatar} size={40} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{review.studentName}</Text>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>{formatDateShort(review.date)}</Text>
        </View>
        <RatingStars rating={review.rating} size={12} showValue={false} />
        <Text style={[styles.comment, { color: theme.colors.textSecondary }]}>{review.comment}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 13.5, fontWeight: '700' },
  date: { fontSize: 11 },
  comment: { fontSize: 13, marginTop: 6, lineHeight: 19 },
});
