import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { useLive } from '../../context/LiveContext';
import { ScreenContainer } from '../../components/layout';
import { SectionHeader, IconButton } from '../../components/ui';
import { CourseCard, CategoryPill } from '../../components/course';
import { GradeTrackSheet } from '../../components/student/GradeTrackSheet';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { Student, GradeTrack } from '../../types';
import { GRADE_TRACKS, getGradeTrackInfo } from '../../constants/gradeTracks';
import { FEATURES } from '../../constants/features';

type Props = StudentTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const student = user as Student;
  const { isFavorite, toggleFavorite, refresh } = useStudentData();
  const { courses, categories, loading } = useCatalog();
  const { liveSessions } = useLive();
  const liveNow = liveSessions.find((l) => l.status === 'live');
  const [trackSheetOpen, setTrackSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };
  const trackInfo = FEATURES.gradeTrack ? getGradeTrackInfo(student?.gradeTrack) : undefined;

  const handleSelectTrack = (track: GradeTrack) => {
    updateProfile({ gradeTrack: track } as Partial<Student>);
    setTrackSheetOpen(false);
  };

  // Courses matching the student's chosen track come first (when that feature is on); featured/bestseller and rating break ties.
  const recommended = [...courses].sort((a, b) => {
    const matches = (c: typeof a) => (FEATURES.gradeTrack && student?.gradeTrack && c.gradeTracks.includes(student.gradeTrack as GradeTrack) ? 3 : 0);
    const weight = (c: typeof a) => matches(c) + (c.isFeatured ? 2 : 0) + (c.isBestseller ? 1 : 0);
    return weight(b) - weight(a) || b.rating - a.rating;
  });
  const firstName = student?.fullName?.split(' ')[0] ?? 'Étudiant';

  return (
    <View style={{ flex: 1 }}>
    <ScreenContainer scroll edges={['top']} refreshing={refreshing} onRefresh={handleRefresh}>
      <Animated.View entering={FadeInDown.delay(40).springify()} style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Bonjour {firstName} 👋</Text>
          <Text style={[styles.heading, { color: theme.colors.text }]}>Que voulez-vous apprendre ?</Text>
        </View>
        <IconButton icon="notifications-outline" onPress={() => {}} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <Pressable onPress={() => navigation.navigate('Search')} style={[styles.searchBar, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <Text style={[styles.searchPlaceholder, { color: theme.colors.textMuted }]}>Rechercher un cours, un formateur...</Text>
        </Pressable>
      </Animated.View>

      {FEATURES.gradeTrack && (trackInfo ? (
        <Pressable
          onPress={() => setTrackSheetOpen(true)}
          style={[styles.trackPill, { backgroundColor: theme.colors.primarySoft }]}
        >
          <Ionicons name={trackInfo.icon} size={16} color={theme.colors.primary} />
          <Text style={[styles.trackPillLabel, { color: theme.colors.primary }]}>{trackInfo.label}</Text>
          <Text style={[styles.trackPillChange, { color: theme.colors.primary }]}>Changer</Text>
        </Pressable>
      ) : (
        <View style={[styles.trackCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.trackCardTitle, { color: theme.colors.text }]}>Choisis ta filière</Text>
          <Text style={[styles.trackCardSubtitle, { color: theme.colors.textMuted }]}>Pour des recommandations adaptées à ton programme</Text>
          <View style={styles.trackGrid}>
            {GRADE_TRACKS.map((track) => (
              <Pressable
                key={track.id}
                onPress={() => handleSelectTrack(track.id)}
                style={[styles.trackChip, { backgroundColor: theme.colors.primarySoft }]}
              >
                <Ionicons name={track.icon} size={15} color={theme.colors.primary} />
                <Text style={[styles.trackChipLabel, { color: theme.colors.primary }]}>{track.shortLabel}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {FEATURES.live && liveNow && (
        <Pressable onPress={() => navigation.navigate('LiveRoom', { liveId: liveNow.id })}>
          <LinearGradient colors={liveNow.coverGradient} style={styles.liveBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.liveDotRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
            <Text style={styles.liveTitle} numberOfLines={1}>{liveNow.title}</Text>
            <Text style={styles.liveSubtitle}>{liveNow.teacherName} · {liveNow.viewersCount} spectateurs</Text>
          </LinearGradient>
        </Pressable>
      )}

      <Animated.View entering={FadeInDown.delay(160).springify()}>
        <SectionHeader title="Catégories" subtitle="Explorez par domaine" onAction={() => navigation.navigate('Explore')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
          {categories.map((cat, i) => (
            <Animated.View key={cat.id} entering={FadeInRight.delay(180 + Math.min(i, 6) * 40).springify()}>
              <CategoryPill category={cat} onPress={() => navigation.navigate('Explore')} />
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).springify()}>
        <SectionHeader
          title="Recommandés pour vous"
          subtitle={trackInfo ? `Adaptés à ta filière · ${trackInfo.shortLabel}` : 'Cours populaires et bien notés'}
          onAction={() => navigation.navigate('Explore')}
        />
        {loading ? (
          <FlatList
            horizontal
            data={[1, 2, 3]}
            keyExtractor={(i) => String(i)}
            showsHorizontalScrollIndicator={false}
            renderItem={() => <CourseCardSkeleton />}
            style={{ marginBottom: 12 }}
          />
        ) : (
          <FlatList
            horizontal
            data={recommended}
            keyExtractor={(c) => c.id}
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInRight.delay(260 + Math.min(index, 6) * 50).springify()}>
                <CourseCard
                  course={item}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                />
              </Animated.View>
            )}
          />
        )}
      </Animated.View>
    </ScreenContainer>

    {FEATURES.gradeTrack && (
      <GradeTrackSheet
        visible={trackSheetOpen}
        currentTrack={student?.gradeTrack}
        onSelect={handleSelectTrack}
        onClose={() => setTrackSheetOpen(false)}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 8 },
  greeting: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  heading: { fontSize: 21, fontWeight: '700', maxWidth: 250 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, height: 50, marginBottom: 20 },
  searchPlaceholder: { marginLeft: 10, fontSize: 13.5 },
  trackPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 20 },
  trackPillLabel: { fontSize: 12.5, fontWeight: '700', marginLeft: 6 },
  trackPillChange: { fontSize: 11.5, fontWeight: '700', marginLeft: 8, textDecorationLine: 'underline' },
  trackCard: { borderRadius: 18, padding: 16, marginBottom: 20 },
  trackCardTitle: { fontSize: 15, fontWeight: '700' },
  trackCardSubtitle: { fontSize: 12, marginTop: 3, marginBottom: 14 },
  trackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trackChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  trackChipLabel: { fontSize: 12, fontWeight: '700', marginLeft: 5 },
  liveBanner: { borderRadius: 18, padding: 16, marginBottom: 28 },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  liveBadgeText: { color: '#fff', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.5 },
  liveTitle: { color: '#fff', fontSize: 15.5, fontWeight: '700', marginBottom: 4 },
  liveSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});
