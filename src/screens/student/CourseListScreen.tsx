import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Chip, IconButton, EmptyState, Button } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { CourseLevel, GradeTrack } from '../../types';
import { GRADE_TRACKS } from '../../constants/gradeTracks';
import { FEATURES } from '../../constants/features';

type Props = StudentTabScreenProps<'Explore'>;
type SortBy = 'popular' | 'price' | 'rating';

const levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];
const sortOptions: Array<{ id: SortBy; label: string }> = [
  { id: 'popular', label: 'Populaire' },
  { id: 'price', label: 'Prix croissant' },
  { id: 'rating', label: 'Mieux notés' },
];

export const CourseListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite, refresh } = useStudentData();
  const { courses, categories } = useCatalog();
  const [refreshing, setRefreshing] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [gradeTrack, setGradeTrack] = useState<GradeTrack | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = (categoryId ? 1 : 0) + (level ? 1 : 0) + (gradeTrack ? 1 : 0);

  const filtered = useMemo(() => {
    let list = courses;
    if (categoryId) list = list.filter((c) => c.categoryId === categoryId);
    if (level) list = list.filter((c) => c.level === level);
    if (gradeTrack) list = list.filter((c) => c.gradeTracks.includes(gradeTrack));
    if (sortBy === 'price') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'popular') list = [...list].sort((a, b) => b.studentsCount - a.studentsCount);
    return list;
  }, [courses, categoryId, level, gradeTrack, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };

  const resetFilters = () => {
    setCategoryId(null);
    setLevel(null);
    setGradeTrack(null);
    setSortBy('popular');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer edges={['top']}>
        <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Explorer les cours</Text>
          <IconButton icon="search-outline" onPress={() => navigation.navigate('Search')} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).springify()} style={styles.toolbar}>
          <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>{filtered.length} cours trouvés</Text>
          {FEATURES.advancedFilters && (
            <Pressable
              onPress={() => setFiltersOpen(true)}
              style={[styles.filterBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, ...theme.shadow('sm') }]}
            >
              <Ionicons name="options-outline" size={16} color={theme.colors.text} />
              <Text style={[styles.filterBtnLabel, { color: theme.colors.text }]}>Filtrer</Text>
              {activeFilterCount > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        </Animated.View>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify()}>
              <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Aucun cours trouvé"
              description="Essayez d'ajuster vos filtres de recherche."
              actionLabel={activeFilterCount > 0 ? 'Réinitialiser les filtres' : undefined}
              onAction={activeFilterCount > 0 ? resetFilters : undefined}
            />
          }
        />
      </ScreenContainer>

      {FEATURES.advancedFilters && filtersOpen && (
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setFiltersOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Filtrer & trier</Text>
              <IconButton icon="close" onPress={() => setFiltersOpen(false)} variant="ghost" size={34} />
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Catégorie</Text>
              <View style={styles.chipWrap}>
                <Chip label="Toutes" selected={!categoryId} onPress={() => setCategoryId(null)} />
                {categories.map((cat) => (
                  <Chip key={cat.id} label={cat.name} selected={categoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Filière</Text>
              <View style={styles.chipWrap}>
                <Chip label="Toutes" selected={!gradeTrack} onPress={() => setGradeTrack(null)} />
                {GRADE_TRACKS.map((track) => (
                  <Chip key={track.id} label={track.shortLabel} selected={gradeTrack === track.id} onPress={() => setGradeTrack(track.id)} />
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Niveau</Text>
              <View style={styles.chipWrap}>
                <Chip label="Tous niveaux" selected={!level} onPress={() => setLevel(null)} />
                {levels.map((lvl) => (
                  <Chip key={lvl} label={lvl} selected={level === lvl} onPress={() => setLevel(lvl)} />
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Trier par</Text>
              <View style={styles.chipWrap}>
                {sortOptions.map((opt) => (
                  <Chip key={opt.id} label={opt.label} selected={sortBy === opt.id} onPress={() => setSortBy(opt.id)} />
                ))}
              </View>
            </ScrollView>

            <Button label={`Voir ${filtered.length} cours`} onPress={() => setFiltersOpen(false)} style={{ marginTop: 12 }} />
            {activeFilterCount > 0 && (
              <Button label="Réinitialiser" variant="ghost" onPress={resetFilters} style={{ marginTop: 4 }} />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8, marginBottom: 16 },
  title: { fontSize: 21, fontWeight: '700' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultCount: { fontSize: 13, fontWeight: '600' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5 },
  filterBtnLabel: { fontSize: 13, fontWeight: '700', marginLeft: 6 },
  filterBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 6, paddingHorizontal: 4 },
  filterBadgeText: { color: '#fff', fontSize: 10.5, fontWeight: '700' },
  list: { flex: 1 },

  modalRoot: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: '85%' },
  sheetScroll: { maxHeight: 320 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
