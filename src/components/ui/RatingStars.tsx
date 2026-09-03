import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 14, showValue = true, count }) => {
  const { theme } = useTheme();
  const stars = [0, 1, 2, 3, 4];

  return (
    <View style={styles.row}>
      {showValue && <Text style={[styles.value, { fontSize: size, color: theme.colors.text }]}>{rating.toFixed(1)}</Text>}
      <View style={styles.starsRow}>
        {stars.map((i) => {
          const filled = rating >= i + 1;
          const half = !filled && rating > i && rating < i + 1;
          return (
            <Ionicons
              key={i}
              name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
              size={size}
              color={theme.colors.accent}
              style={{ marginRight: 1 }}
            />
          );
        })}
      </View>
      {typeof count === 'number' && (
        <Text style={[styles.count, { fontSize: size - 2, color: theme.colors.textMuted }]}>({count.toLocaleString('fr-FR')})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  starsRow: { flexDirection: 'row', marginLeft: 4 },
  value: { fontWeight: '700', marginRight: 2 },
  count: { marginLeft: 5 },
});
