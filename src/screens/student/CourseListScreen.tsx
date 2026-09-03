import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { Chip, IconButton, EmptyState } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { courses, categories } from '../../data';
import { CourseLevel } from '../../types';

type Props = StudentTabScreenProps<'Explore'>;

const levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];

export const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useStudentData();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating'>('popular');

  const filtered = useMemo(() => {
    let list = courses;
    if (categoryId) list = list.filter((c) => c.categoryId === categoryId);
    if (level) list = list.filter((c) => c.level === level);
    if (sortBy === 'price') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'popular') list = [...list].sort((a, b) => b.studentsCount - a.studentsCount);
    return list;
  }, [categoryId, level, sortBy]);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Explorer les cours</Text>
        <IconButton icon="search-outline" onPress={() => navigation.navigate('Search')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <Chip label="Toutes catégories" selected={!categoryId} onPress={() => setCategoryId(null)} />
        {categories.map((cat) => (
          <Chip key={cat.id} label={cat.name} selected={categoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <Chip label="Tous niveaux" selected={!level} onPress={() => setLevel(null)} icon="layers-outline" />
        {levels.map((lvl) => (
          <Chip key={lvl} label={lvl} selected={level === lvl} onPress={() => setLevel(lvl)} />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>{filtered.length} cours trouvés</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label="Populaire" selected={sortBy === 'popular'} onPress={() => setSortBy('popular')} />
          <Chip label="Prix" selected={sortBy === 'price'} onPress={() => setSortBy('price')} />
          <Chip label="Note" selected={sortBy === 'rating'} onPress={() => setSortBy('rating')} />
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
        )}
        ListEmptyComponent={<EmptyState icon="search-outline" title="Aucun cours trouvé" description="Essayez d'ajuster vos filtres de recherche." />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  title: { fontSize: 21, fontWeight: '800' },
  sortRow: { marginBottom: 14 },
  resultCount: { fontSize: 12.5, fontWeight: '600', marginBottom: 10 },
});
