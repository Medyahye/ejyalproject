import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { IconButton, EmptyState } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { getCourseById } from '../../data';
import { StudentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { favoriteIds } = useStudentData();

  const favCourses = useMemo(
    () => favoriteIds.map((id) => getCourseById(id)).filter((c): c is NonNullable<typeof c> => !!c),
    [favoriteIds]
  );

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes favoris</Text>
      </View>
      <FlatList
        data={favCourses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
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
  title: { fontSize: 19, fontWeight: '800', marginLeft: 4 },
});
