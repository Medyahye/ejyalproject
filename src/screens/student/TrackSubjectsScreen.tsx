import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { EmptyState } from '../../components/ui';
import { GradeTrack } from '../../types';
import { getGradeTrackInfo } from '../../constants/gradeTracks';

type Props = StudentStackScreenProps<'TrackSubjects'>;

export const TrackSubjectsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { track } = route.params;
  const { categories, courses } = useCatalog();
  const trackInfo = getGradeTrackInfo(track as GradeTrack);

  const subjects = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        count: courses.filter((c) => c.categoryId === cat.id && c.gradeTracks.includes(track as GradeTrack)).length,
      }))
      .filter((s) => s.count > 0);
  }, [categories, courses, track]);

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ marginRight: 4 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View
          style={[styles.trackBadge, { backgroundColor: trackInfo?.color ?? theme.colors.primary }]}
        >
          <Text style={styles.trackBadgeCode}>{trackInfo?.code}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{trackInfo?.label ?? 'Filière'}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Matières disponibles</Text>
        </View>
      </Animated.View>

      <FlatList
        data={subjects}
        keyExtractor={(s) => s.category.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(60 + Math.min(index, 8) * 40).springify()} style={{ flex: 1 }}>
            <Pressable
              onPress={() =>
                navigation.navigate('CategoryCourses', { track, categoryId: item.category.id, categoryName: item.category.name })
              }
              style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${item.category.color}1A` }]}>
                <Ionicons name={item.category.icon as any} size={22} color={item.category.color} />
              </View>
              <Text numberOfLines={2} style={[styles.cardName, { color: theme.colors.text }]}>{item.category.name}</Text>
              <Text style={[styles.cardCount, { color: theme.colors.textMuted }]}>
                {item.count} package{item.count > 1 ? 's' : ''}
              </Text>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="Aucune matière pour l'instant"
            description={`Aucun package n'est encore disponible pour ${trackInfo?.shortLabel ?? 'cette filière'}. Reviens bientôt !`}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginTop: 20, marginBottom: 22 },
  trackBadge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trackBadgeCode: { color: '#fff', fontSize: 14, fontWeight: '800' },
  title: { fontSize: 19, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  card: { borderRadius: 16, padding: 14, alignItems: 'flex-start' },
  iconCircle: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardName: { fontSize: 14.5, fontWeight: '700', lineHeight: 19, marginBottom: 4, minHeight: 38 },
  cardCount: { fontSize: 12.5, fontWeight: '600' },
});
