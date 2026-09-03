import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Category } from '../../types';

interface CategoryPillProps {
  category: Category;
  onPress?: () => void;
  selected?: boolean;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ category, onPress, selected }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? category.color : theme.colors.card,
          opacity: pressed ? 0.9 : 1,
          ...theme.shadow('sm'),
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: selected ? 'rgba(255,255,255,0.25)' : `${category.color}1A` },
        ]}
      >
        <Ionicons name={category.icon as any} size={20} color={selected ? '#fff' : category.color} />
      </View>
      <Text numberOfLines={2} style={[styles.name, { color: selected ? '#fff' : theme.colors.text }]}>
        {category.name}
      </Text>
      <Text style={[styles.count, { color: selected ? 'rgba(255,255,255,0.85)' : theme.colors.textMuted }]}>
        {category.courseCount} cours
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { width: 112, borderRadius: 16, padding: 12, marginRight: 12 },
  iconCircle: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  name: { fontSize: 12.5, fontWeight: '700', lineHeight: 16, marginBottom: 4, minHeight: 32 },
  count: { fontSize: 10.5, fontWeight: '600' },
});
