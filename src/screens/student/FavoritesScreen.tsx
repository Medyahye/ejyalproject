import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { IconButton, EmptyState } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { StudentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { favoriteIds } = useStudentData();
  const { getCourseById } = useCatalog();

  const favCourses = useMemo(
    () => favoriteIds.map((id) => getCourseById(id)).filter((c): c is NonNullable<typeof c> => !!c),
    [favoriteIds, getCourseById]
  );

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes favoris</Text>
      </Animated.View>
      <FlatList
        data={favCourses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).springify()}>
            <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState icon="heart-outline" title="Aucun favori" description="Ajoutez des cours à vos favoris pour les retrouver ici." />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '700', marginLeft: 4 },
});
