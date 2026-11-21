import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useCatalog } from '../../context/CatalogContext';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { EmptyState, SegmentedControl } from '../../components/ui';
import { TeacherCard } from '../../components/course';
import { haptics } from '../../utils/haptics';

type Props = StudentStackScreenProps<'Teachers'>;
type Filter = 'all' | 'favorites' | 'promo';

/** Fenêtre des professeurs : big photos, search, favorites and free promos. */
export const TeachersScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { teachers, categories } = useCatalog();
  const { isFavoriteTeacher, toggleFavoriteTeacher, favoriteTeacherIds } = useStudentData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      if (filter === 'favorites' && !isFavoriteTeacher(t.id)) return false;
      if (filter === 'promo' && !t.isPromoActive) return false;
      if (categoryId && !t.teachingCategoryIds.includes(categoryId)) return false;
      if (!q) return true;
      return [t.fullName, t.headline, ...t.specialties].some((v) => v.toLowerCase().includes(q));
    });
  }, [teachers, query, filter, categoryId, isFavoriteTeacher]);

  const usedCategories = categories.filter((c) => teachers.some((t) => t.teachingCategoryIds.includes(c.id)));
  const cardWidth = (width - 40 - 12) / 2;

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Les professeurs</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{teachers.length} profs · {favoriteTeacherIds.length} en favoris</Text>
        </View>
      </Animated.View>

      <View style={[styles.search, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <Ionicons name="search" size={17} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nom, matière, spécialité…"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>

      <View style={{ marginBottom: 12 }}>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'all', label: 'Tous' },
            { id: 'favorites', label: 'Favoris' },
            { id: 'promo', label: 'Offerts' },
          ]}
        />
      </View>

      <FlatList
        horizontal
        data={usedCategories}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 14 }}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const active = item.id === categoryId;
          return (
            <Pressable
              onPress={() => {
                haptics.select();
                setCategoryId(active ? null : item.id);
              }}
              style={[styles.catChip, { backgroundColor: active ? item.color : theme.colors.card, borderColor: active ? item.color : theme.colors.border }]}
            >
              <Ionicons name={item.icon as any} size={14} color={active ? '#fff' : item.color} />
              <Text style={[styles.catChipText, { color: active ? '#fff' : theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
            <TeacherCard
              teacher={item}
              width={cardWidth}
              height={cardWidth * 1.4}
              style={{ marginRight: 0 }}
              isFavorite={isFavoriteTeacher(item.id)}
              onToggleFavorite={() => {
                haptics.tap();
                toggleFavoriteTeacher(item.id);
              }}
              onPress={() => navigation.navigate('TeacherProfile', { teacherId: item.id })}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={filter === 'favorites' ? 'heart-outline' : 'people-outline'}
            title={filter === 'favorites' ? 'Aucun prof favori' : 'Aucun professeur trouvé'}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  search: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, height: 48, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14.5 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, maxWidth: 220 },
  catChipText: { fontSize: 12.5, fontWeight: '700' },
});
