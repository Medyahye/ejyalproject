import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { IconButton, EmptyState, SegmentedControl } from '../../components/ui';
import { CourseListItem, TeacherCard } from '../../components/course';
import { StudentStackParamList } from '../../navigation/types';
import { haptics } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const { favoriteIds, favoriteTeacherIds, toggleFavoriteTeacher } = useStudentData();
  const { getCourseById, getTeacher } = useCatalog();
  const [tab, setTab] = useState<'teachers' | 'courses'>(favoriteTeacherIds.length > 0 ? 'teachers' : 'courses');

  const favCourses = useMemo(
    () => favoriteIds.map((id) => getCourseById(id)).filter((c): c is NonNullable<typeof c> => !!c),
    [favoriteIds, getCourseById]
  );
  const favTeachers = useMemo(
    () => favoriteTeacherIds.map((id) => getTeacher(id)).filter((t): t is NonNullable<typeof t> => !!t),
    [favoriteTeacherIds, getTeacher]
  );
  const cardWidth = (width - 40 - 12) / 2;

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes favoris</Text>
      </Animated.View>
      <View style={{ marginBottom: 16 }}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { id: 'teachers', label: `Professeurs (${favTeachers.length})` },
            { id: 'courses', label: `Cours (${favCourses.length})` },
          ]}
        />
      </View>

      {tab === 'teachers' ? (
        <FlatList
          key="teachers"
          data={favTeachers}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify()}>
              <TeacherCard
                teacher={item}
                width={cardWidth}
                height={cardWidth * 1.35}
                style={{ marginRight: 0 }}
                isFavorite
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
              icon="heart-outline"
              title="Aucun prof favori"
              actionLabel="Voir les professeurs"
              onAction={() => navigation.navigate('Teachers')}
            />
          }
        />
      ) : (
        <FlatList
          key="courses"
          data={favCourses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify()}>
              <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
            </Animated.View>
          )}
          ListEmptyComponent={<EmptyState icon="heart-outline" title="Aucun cours favori" />}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', marginLeft: 4 },
});
