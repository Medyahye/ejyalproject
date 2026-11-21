import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { CourseListItem } from '../../components/course';
import { EmptyState } from '../../components/ui';
import { GradeTrack } from '../../types';
import { getLevelInfo } from '../../constants/levels';

type Props = StudentStackScreenProps<'CategoryCourses'>;

export const CategoryCoursesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { track, categoryId, categoryName } = route.params;
  const { courses, getTrack } = useCatalog();
  const trackInfo = getTrack(track);
  const levelColor = getLevelInfo(trackInfo?.level)?.gradient[1];

  const results = useMemo(
    () => courses.filter((c) => c.categoryId === categoryId && c.gradeTracks.includes(track as GradeTrack)),
    [courses, categoryId, track]
  );

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{categoryName}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{trackInfo?.label ?? 'Classe'}</Text>
        </View>
      </Animated.View>

      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
            {results.length} package{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''}
          </Text>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(60 + Math.min(index, 8) * 40).springify()}>
            <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="Aucun package pour l'instant"
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginTop: 20, marginBottom: 22 },
  title: { fontSize: 19, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  resultCount: { fontSize: 13.5, fontWeight: '600', marginBottom: 14 },
});
