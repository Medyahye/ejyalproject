import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, RefreshControl, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { EmptyState, SegmentedControl } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { Course } from '../../types';
import { TERM_LABELS } from '../../constants/offers';
import { haptics } from '../../utils/haptics';

type Props = StudentTabScreenProps<'MyCourses'>;
type FilterTab = 'all' | 'inprogress' | 'completed';
type GroupBy = 'recent' | 'subject' | 'term' | 'teacher' | 'progress';

const GROUPS: Array<{ id: GroupBy; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'recent', label: 'Récents', icon: 'time-outline' },
  { id: 'subject', label: 'Matière', icon: 'book-outline' },
  { id: 'term', label: 'Trimestre', icon: 'calendar-outline' },
  { id: 'teacher', label: 'Prof', icon: 'person-outline' },
  { id: 'progress', label: 'Progression', icon: 'trending-up-outline' },
];
const STORAGE_KEY = 'mycourses_group_by';

export const MyCoursesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { purchasedCourseIds, pendingCourseIds, courseProgress, refresh } = useStudentData();
  const { getCourseById } = useCatalog();
  const [tab, setTab] = useState<FilterTab>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('recent');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => v && GROUPS.some((g) => g.id === v) && setGroupBy(v as GroupBy))
      .catch(() => {});
  }, []);

  const chooseGroup = (g: GroupBy) => {
    haptics.select();
    setGroupBy(g);
    AsyncStorage.setItem(STORAGE_KEY, g).catch(() => {});
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };

  const toCourses = (ids: string[]) => ids.map((id) => getCourseById(id)).filter((c): c is Course => !!c);
  const myCourses = useMemo(() => toCourses(purchasedCourseIds), [purchasedCourseIds, getCourseById]);
  const pendingCourses = useMemo(() => toCourses(pendingCourseIds), [pendingCourseIds, getCourseById]);

  const filtered = useMemo(
    () =>
      myCourses.filter((c) => {
        const progress = courseProgress[c.id] ?? 0;
        if (tab === 'inprogress') return progress < 1;
        if (tab === 'completed') return progress >= 1;
        return true;
      }),
    [myCourses, courseProgress, tab]
  );

  const sections = useMemo(() => {
    const result: Array<{ title: string; data: Course[]; pending?: boolean }> = [];
    if (pendingCourses.length > 0 && tab === 'all') {
      result.push({ title: '', data: pendingCourses, pending: true });
    }
    const groupMap = new Map<string, Course[]>();
    const add = (key: string, c: Course) => groupMap.set(key, [...(groupMap.get(key) ?? []), c]);
    if (groupBy === 'recent') {
      if (filtered.length) result.push({ title: '', data: filtered });
      return result;
    }
    if (groupBy === 'progress') {
      const sorted = [...filtered].sort((a, b) => (courseProgress[b.id] ?? 0) - (courseProgress[a.id] ?? 0));
      if (sorted.length) result.push({ title: 'Du plus avancé au moins avancé', data: sorted });
      return result;
    }
    const ordered = groupBy === 'term' ? [...filtered].sort((a, b) => a.term - b.term) : filtered;
    ordered.forEach((c) => {
      if (groupBy === 'subject') add(c.categoryName, c);
      if (groupBy === 'term') add(TERM_LABELS[c.term] ?? `Trimestre ${c.term}`, c);
      if (groupBy === 'teacher') add(c.teacherName, c);
    });
    const keys = [...groupMap.keys()];
    if (groupBy !== 'term') keys.sort((a, b) => a.localeCompare(b, 'fr'));
    keys.forEach((k) => result.push({ title: k, data: groupMap.get(k)! }));
    return result;
  }, [pendingCourses, filtered, groupBy, tab, courseProgress]);

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes cours</Text>
        <Pressable onPress={() => navigation.navigate('Favorites')} hitSlop={8} style={[styles.favBtn, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Ionicons name="heart" size={16} color={theme.colors.danger} />
          <Text style={[styles.favText, { color: theme.colors.text }]}>Favoris</Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupRow}>
          {GROUPS.map((g) => {
            const active = g.id === groupBy;
            return (
              <Pressable
                key={g.id}
                onPress={() => chooseGroup(g.id)}
                style={[styles.groupChip, { backgroundColor: active ? theme.colors.primary : theme.colors.card, borderColor: active ? theme.colors.primary : theme.colors.border }]}
              >
                <Ionicons name={g.icon} size={14} color={active ? '#fff' : theme.colors.textSecondary} />
                <Text style={[styles.groupChipText, { color: active ? '#fff' : theme.colors.text }]}>{g.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <SectionList
        sections={sections}
        keyExtractor={(c, i) => `${c.id}-${i}`}
        contentContainerStyle={{ paddingBottom: 30 }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        renderSectionHeader={({ section }) => !section.title ? null : (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionCount, { color: theme.colors.textMuted }]}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify()}>
            <CourseListItem
              course={item}
              rightAccessory={<View />}
              pending={section.pending}
              progress={section.pending ? undefined : courseProgress[item.id] ?? 0}
              onPress={() =>
                section.pending || item.isLocked
                  ? navigation.navigate('CourseDetail', { courseId: item.id })
                  : navigation.navigate('VideoPlayer', { courseId: item.id })
              }
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="play-circle-outline"
            title={tab === 'completed' ? 'Aucun cours terminé' : 'Aucun cours pour le moment'}
            actionLabel={tab === 'completed' ? undefined : 'Découvrir les packs'}
            onAction={tab === 'completed' ? undefined : () => navigation.navigate('Home')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  favBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  favText: { fontSize: 13, fontWeight: '700' },
  tabRow: { flexDirection: 'row', marginBottom: 14 },
  sortLabel: { fontSize: 11.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  groupRow: { gap: 8, paddingBottom: 12 },
  groupChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  groupChipText: { fontSize: 12.5, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionCount: { fontSize: 12.5, fontWeight: '700' },
});
