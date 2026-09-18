import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { useLive } from '../../context/LiveContext';
import { ScreenContainer } from '../../components/layout';
import { SectionHeader, IconButton, EmptyState, Avatar, PulsingDot, SwipeToDismiss } from '../../components/ui';
import { CourseCard } from '../../components/course';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { Student, GradeTrack } from '../../types';
import { GRADE_TRACKS, getGradeTrackInfo } from '../../constants/gradeTracks';
import { FEATURES } from '../../constants/features';
import { haptics } from '../../utils/haptics';
import { SwipeToDismissHandle } from '../../components/ui/SwipeToDismiss';

type Props = StudentTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const student = user as Student;
  const { isFavorite, toggleFavorite, refresh } = useStudentData();
  const { courses, loading } = useCatalog();
  const { liveSessions, refresh: refreshLive } = useLive();
  const liveNow = liveSessions.find((l) => l.status === 'live');
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedLiveId, setDismissedLiveId] = useState<string | null>(null);
  const liveSwipeRef = useRef<SwipeToDismissHandle>(null);
  const showLiveBanner = FEATURES.live && !!liveNow && liveNow.id !== dismissedLiveId;

  // Poll while Home is focused so a newly-started live shows up on its own —
  // no push notifications yet, but the banner appears within ~20s without any manual refresh.
  useFocusEffect(
    useCallback(() => {
      if (!FEATURES.live) return;
      const interval = setInterval(() => {
        refreshLive().catch(() => {});
      }, 20000);
      return () => clearInterval(interval);
    }, [refreshLive])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };
  const trackInfo = FEATURES.gradeTrack ? getGradeTrackInfo(student?.gradeTrack) : undefined;

  const handleTrackPress = (track: GradeTrack) => {
    haptics.select();
    if (student?.gradeTrack !== track) {
      updateProfile({ gradeTrack: track } as Partial<Student>);
    }
    navigation.navigate('TrackSubjects', { track });
  };

  // Packages published for the student's own track — a direct filter, not a fuzzy ranking.
  const trackPackages = useMemo(() => {
    if (!student?.gradeTrack) return [];
    return courses.filter((c) => c.gradeTracks.includes(student.gradeTrack as GradeTrack));
  }, [courses, student?.gradeTrack]);
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

      {showLiveBanner && liveNow && (
        <Animated.View key={liveNow.id} entering={ZoomIn.springify().damping(14)}>
          <SwipeToDismiss ref={liveSwipeRef} marginBottom={22} onDismissed={() => setDismissedLiveId(liveNow.id)}>
            <Pressable onPress={() => navigation.navigate('LiveRoom', { liveId: liveNow.id })}>
              <LinearGradient colors={liveNow.coverGradient} style={styles.liveBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.liveTopRow}>
                  <View style={styles.liveDotRow}>
                    <PulsingDot size={7} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.liveBadgeText}>EN DIRECT MAINTENANT</Text>
                  </View>
                  <View style={styles.liveDotRow}>
                    <View style={styles.liveViewersPill}>
                      <Ionicons name="eye" size={12} color="#fff" />
                      <Text style={styles.liveViewersText}>{liveNow.viewersCount}</Text>
                    </View>
                    <Pressable
                      hitSlop={10}
                      onPress={(e) => {
                        e.stopPropagation();
                        haptics.tap();
                        liveSwipeRef.current?.dismiss();
                      }}
                      style={styles.liveCloseBtn}
                    >
                      <Ionicons name="close" size={13} color="#fff" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.liveMainRow}>
                  <Avatar uri={liveNow.teacherAvatar} size={44} ring />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.liveTitle} numberOfLines={1}>{liveNow.title}</Text>
                    <Text style={styles.liveSubtitle} numberOfLines={1}>{liveNow.teacherName} · {liveNow.categoryName}</Text>
                  </View>
                </View>

                <View style={styles.liveJoinBtn}>
                  <Text style={styles.liveJoinText}>Rejoindre le direct</Text>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </View>
              </LinearGradient>
            </Pressable>
          </SwipeToDismiss>
        </Animated.View>
      )}

      {FEATURES.gradeTrack && (
        <Animated.View entering={FadeInDown.delay(130).springify()} style={{ marginBottom: 24 }}>
          <View style={styles.trackHeaderRow}>
            <View>
              <Text style={[styles.trackHeaderTitle, { color: theme.colors.text }]}>Ta filière</Text>
              <Text style={[styles.trackHeaderSubtitle, { color: theme.colors.textMuted }]}>
                {trackInfo ? `Cours personnalisés pour ${trackInfo.shortLabel}` : 'Choisis-la pour des recommandations adaptées'}
              </Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trackScrollContent}>
            {GRADE_TRACKS.map((track, i) => {
              const selected = student?.gradeTrack === track.id;
              return (
                <Animated.View key={track.id} entering={FadeInRight.delay(160 + Math.min(i, 6) * 45).springify()}>
                  <Pressable
                    onPress={() => handleTrackPress(track.id)}
                    style={[
                      styles.trackTile,
                      { backgroundColor: track.color },
                      selected ? { ...theme.shadow('md'), transform: [{ scale: 1.04 }] } : { opacity: 0.9 },
                    ]}
                  >
                    {selected && (
                      <View style={styles.trackTileCheck}>
                        <Ionicons name="checkmark" size={14} color={track.color} />
                      </View>
                    )}
                    <Text style={styles.trackTileCode}>{track.code}</Text>
                    <Text style={styles.trackTileLabel} numberOfLines={1}>{track.shortLabel}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(240).springify()}>
        <SectionHeader
          title={trackInfo ? `Programme ${trackInfo.shortLabel}` : 'Packages disponibles'}
          subtitle={trackInfo ? 'Les cours pensés pour ta filière' : 'Choisis ta filière ci-dessus'}
          onAction={() => navigation.navigate('Explore')}
        />
        {!student?.gradeTrack ? (
          <EmptyState
            icon="albums-outline"
            title="Choisis ta filière"
            description="Sélectionne ta filière ci-dessus pour voir les packages disponibles pour ton programme."
          />
        ) : loading ? (
          <FlatList
            horizontal
            data={[1, 2, 3]}
            keyExtractor={(i) => String(i)}
            showsHorizontalScrollIndicator={false}
            renderItem={() => <CourseCardSkeleton />}
            style={{ marginBottom: 12 }}
          />
        ) : trackPackages.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="Aucun package pour l'instant"
            description={`Aucun cours n'est encore disponible pour ${trackInfo?.shortLabel}. Reviens bientôt !`}
          />
        ) : (
          <FlatList
            horizontal
            data={trackPackages}
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, marginTop: 24 },
  greeting: { fontSize: 15, fontWeight: '600', marginBottom: 5 },
  heading: { fontSize: 24, fontWeight: '700', maxWidth: 260 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, height: 52, marginBottom: 20 },
  searchPlaceholder: { marginLeft: 10, fontSize: 14.5 },
  trackHeaderRow: { marginBottom: 12 },
  trackHeaderTitle: { fontSize: 16.5, fontWeight: '700' },
  trackHeaderSubtitle: { fontSize: 13, marginTop: 3 },
  trackScrollContent: { paddingRight: 8 },
  trackTile: {
    width: 140,
    height: 140,
    borderRadius: 24,
    padding: 12,
    marginRight: 12,
    justifyContent: 'space-between',
  },
  trackTileCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTileCode: { color: '#fff', fontSize: 46, fontWeight: '800', lineHeight: 48 },
  trackTileLabel: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '700' },
  liveBanner: { borderRadius: 20, padding: 18 },
  liveTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  liveDotRow: { flexDirection: 'row', alignItems: 'center' },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  liveViewersPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  liveViewersText: { color: '#fff', fontSize: 11.5, fontWeight: '700', marginLeft: 4 },
  liveCloseBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  liveMainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  liveTitle: { color: '#fff', fontSize: 15.5, fontWeight: '700', marginBottom: 3 },
  liveSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5 },
  liveJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 13,
    paddingVertical: 12,
  },
  liveJoinText: { color: '#fff', fontSize: 13.5, fontWeight: '700', marginRight: 8 },
});
