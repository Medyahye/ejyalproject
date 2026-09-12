import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { EmptyState, SegmentedControl } from '../../components/ui';
import { CourseListItem } from '../../components/course';

type Props = StudentTabScreenProps<'MyCourses'>;
type FilterTab = 'all' | 'inprogress' | 'completed';

export const MyCoursesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { purchasedCourseIds, courseProgress, refresh } = useStudentData();
  const { getCourseById } = useCatalog();
  const [tab, setTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };

  const myCourses = useMemo(
    () => purchasedCourseIds.map((id) => getCourseById(id)).filter((c): c is NonNullable<typeof c> => !!c),
    [purchasedCourseIds, getCourseById]
  );

  const filtered = useMemo(() => {
    return myCourses.filter((c) => {
      const progress = courseProgress[c.id] ?? 0;
      if (tab === 'inprogress') return progress > 0 && progress < 1;
      if (tab === 'completed') return progress >= 1;
      return true;
    });
  }, [myCourses, courseProgress, tab]);

  return (
    <ScreenContainer edges={['top']}>
      <Animated.Text entering={FadeInDown.delay(20).springify()} style={[styles.title, { color: theme.colors.text }]}>
        Mes cours
      </Animated.Text>
      <Animated.View entering={FadeInDown.delay(70).springify()} style={styles.tabRow}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { id: 'all', label: `Tous (${myCourses.length})` },
            { id: 'inprogress', label: 'En cours' },
            { id: 'completed', label: 'Terminés' },
          ]}
        />
      </Animated.View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify()}>
            <CourseListItem
              course={item}
              progress={courseProgress[item.id] ?? 0}
              onPress={() => navigation.navigate('VideoPlayer', { courseId: item.id })}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="play-circle-outline"
            title="Aucun cours pour le moment"
            description="Achetez un cours pour commencer votre apprentissage."
            actionLabel="Explorer les cours"
            onAction={() => navigation.navigate('Explore')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 21, fontWeight: '700', marginTop: 8, marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 18 },
});
