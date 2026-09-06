import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Chip, EmptyState } from '../../components/ui';
import { CourseListItem } from '../../components/course';

type Props = StudentTabScreenProps<'MyCourses'>;
type FilterTab = 'all' | 'inprogress' | 'completed';

export const MyCoursesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { purchasedCourseIds, courseProgress } = useStudentData();
  const { getCourseById } = useCatalog();
  const [tab, setTab] = useState<FilterTab>('all');

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
      <Text style={[styles.title, { color: theme.colors.text }]}>Mes cours</Text>
      <View style={styles.tabRow}>
        <Chip label={`Tous (${myCourses.length})`} selected={tab === 'all'} onPress={() => setTab('all')} />
        <Chip label="En cours" selected={tab === 'inprogress'} onPress={() => setTab('inprogress')} />
        <Chip label="Terminés" selected={tab === 'completed'} onPress={() => setTab('completed')} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <CourseListItem
            course={item}
            progress={courseProgress[item.id] ?? 0}
            onPress={() => navigation.navigate('VideoPlayer', { courseId: item.id })}
          />
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
  title: { fontSize: 21, fontWeight: '800', marginTop: 8, marginBottom: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 18 },
});
