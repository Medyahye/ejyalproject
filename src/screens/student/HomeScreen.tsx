import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { useLive } from '../../context/LiveContext';
import { ScreenContainer } from '../../components/layout';
import { SectionHeader, IconButton, EmptyState, Avatar, PulsingDot, SwipeToDismiss } from '../../components/ui';
import { CourseCard, TeacherSquares } from '../../components/course';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { GradeTrackSheet } from '../../components/student/GradeTrackSheet';
import { Student, GradeTrack, OfferType } from '../../types';
import { LEVELS, getLevelInfo } from '../../constants/levels';
import { OFFERS, buildBundle, offerCourses, coursesForTrack } from '../../constants/offers';
import { FEATURES } from '../../constants/features';
import { haptics } from '../../utils/haptics';
import { formatPrice } from '../../utils/formatters';
import { SectionTitle } from '../../components/ui/Tag';

type Props = StudentTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { user, updateProfile } = useAuth();
  const student = user as Student;
  const { isFavorite, toggleFavorite, isFavoriteTeacher, toggleFavoriteTeacher, isPurchased, cartItems, refresh } = useStudentData();
  const { courses, teachers, terms, loading, getTrack, currentTerm } = useCatalog();
  const { liveSessions, refresh: refreshLive } = useLive();
  const liveNow = liveSessions.find((l) => l.status === 'live');
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedLiveId, setDismissedLiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [term, setTerm] = useState<number | null>(null);
  const showLiveBanner = FEATURES.live && !!liveNow && liveNow.id !== dismissedLiveId;
  const { tracks } = useCatalog();

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

  const track = getTrack(student?.gradeTrack);
  const level = getLevelInfo(track?.level);
  const activeTerm = term ?? currentTerm?.number ?? 1;

  const handleSelectTrack = (id: GradeTrack) => {
    haptics.success();
    setSheetOpen(false);
    if (student?.gradeTrack !== id) updateProfile({ gradeTrack: id } as Partial<Student>);
  };

  const trackCourses = useMemo(() => coursesForTrack(courses, track), [courses, track]);
  const termCourses = useMemo(() => trackCourses.filter((c) => c.term === activeTerm), [trackCourses, activeTerm]);
  const freeCourses = useMemo(() => {
    const free = courses.filter((c) => c.isFree && !c.isClosed && !isPurchased(c.id));
    // Courses for the student's class first.
    return free.sort((a, b) => Number(track ? b.gradeTracks.includes(track.id) : 0) - Number(track ? a.gradeTracks.includes(track.id) : 0));
  }, [courses, track, isPurchased]);
  const sortedTeachers = useMemo(() => {
    const rank = (id: string) => (isFavoriteTeacher(id) ? 0 : 1);
    return [...teachers].sort((a, b) => rank(a.id) - rank(b.id));
  }, [teachers, isFavoriteTeacher]);

  const offerCards = useMemo(
    () =>
      (['full', 'main', 'secondary'] as OfferType[]).map((offer) => ({
        offer,
        bundle: buildBundle(offer, offerCourses(offer, courses, track), isPurchased),
      })),
    [courses, track, isPurchased]
  );


  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer scroll edges={['top']} refreshing={refreshing} onRefresh={handleRefresh}>
        <Animated.View entering={FadeInDown.delay(40).springify()} style={styles.searchRow}>
          <Pressable onPress={() => navigation.navigate('Search')} style={[styles.searchBar, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <Text style={[styles.searchPlaceholder, { color: theme.colors.textMuted }]}>Un cours, une matière, un prof…</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Cart')} style={[styles.cartBtn, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <Ionicons name="bag-handle-outline" size={21} color={theme.colors.text} />
            {cartItems.length > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: theme.colors.danger }]}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* Les profs en grand, juste sous la recherche */}
        <Animated.View entering={FadeInDown.delay(90).springify()} style={{ marginBottom: 22 }}>
          <SectionTitle
            title="Nos professeurs"
            right={
              <Pressable onPress={() => navigation.navigate('Teachers')} hitSlop={8} style={[styles.row, { marginTop: 6 }]}>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={15} color={theme.colors.primary} />
              </Pressable>
            }
          />
          <TeacherSquares
            teachers={sortedTeachers}
            isFavorite={isFavoriteTeacher}
            onToggleFavorite={toggleFavoriteTeacher}
            onPress={(id) => navigation.navigate('TeacherProfile', { teacherId: id })}
          />
        </Animated.View>

        {showLiveBanner && liveNow && (
          <Animated.View key={liveNow.id} entering={FadeIn.duration(350)} exiting={FadeOut.duration(200)} style={{ marginBottom: 18 }}>
            <Pressable
              onPress={() => navigation.navigate('LiveRoom', { liveId: liveNow.id })}
              style={({ pressed }) => [styles.liveBar, { backgroundColor: theme.colors.card, opacity: pressed ? 0.85 : 1, ...theme.shadow('sm') }]}
            >
              <Avatar uri={liveNow.teacherAvatar} size={36} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.row}>
                  <PulsingDot size={6} color={theme.colors.danger} style={{ marginRight: 5 }} />
                  <Text style={[styles.liveBadgeText, { color: theme.colors.danger }]}>En direct</Text>
                  <Text style={[styles.liveViewers, { color: theme.colors.textMuted }]}> · {liveNow.viewersCount} spectateurs</Text>
                </View>
                <Text style={[styles.liveTitle, { color: theme.colors.text }]} numberOfLines={1}>{liveNow.title}</Text>
              </View>
              <Pressable
                hitSlop={12}
                onPress={(e) => {
                  e.stopPropagation();
                  haptics.tap();
                  setDismissedLiveId(liveNow.id);
                }}
                style={styles.liveClose}
              >
                <Ionicons name="close" size={16} color={theme.colors.textMuted} />
              </Pressable>
            </Pressable>
          </Animated.View>
        )}

        {/* Pas encore de classe : on la choisit ici. Ensuite elle se change dans Profil → Ma classe. */}
        {!track && (
          <Animated.View entering={FadeInDown.delay(130).springify()} style={{ marginBottom: 26 }}>
              <SectionTitle title="Ton niveau" />
              <View style={styles.levelGrid}>
                {LEVELS.map((l, i) => (
                  <Animated.View key={l.id} entering={FadeInDown.delay(160 + i * 50).springify()} style={styles.levelCell}>
                    <Pressable onPress={() => setSheetOpen(true)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}>
                      <LinearGradient colors={l.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelTile}>
                        <Ionicons name={l.icon} size={26} color="#fff" />
                        <View>
                          <Text style={styles.levelLabel}>{l.label}</Text>
                          <Text style={styles.levelSub}>{l.subtitle}</Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
          </Animated.View>
        )}

        {/* Les 4 choix de l'étudiant — seulement si sa classe a déjà des cours */}
        {track && trackCourses.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).springify()} style={{ marginBottom: 26 }}>
            <SectionTitle title="Les offres" />
            <View style={styles.offerGrid}>
              {offerCards.filter(({ bundle }) => bundle.courses.length > 0).map(({ offer, bundle }, i) => {
                const info = OFFERS[offer as Exclude<OfferType, 'single'>];
                const empty = bundle.courses.length === 0;
                return (
                  <Animated.View key={offer} entering={FadeInDown.delay(200 + i * 50).springify()} style={styles.offerCell}>
                    <Pressable
                      disabled={empty}
                      onPress={() => navigation.navigate('Offer', { offer })}
                      style={({ pressed }) => [styles.offerCard, { backgroundColor: theme.colors.card, opacity: empty ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }], ...theme.shadow('sm') }]}
                    >
                      <LinearGradient colors={info.gradient} style={styles.offerIcon}>
                        <Ionicons name={info.icon} size={20} color="#fff" />
                      </LinearGradient>
                      {info.discount > 0 && bundle.toBuy.length > 1 && (
                        <View style={[styles.discount, { backgroundColor: theme.colors.primarySoft }]}>
                          <Text style={[styles.discountText, { color: theme.colors.primary }]}>-{Math.round(info.discount * 100)}%</Text>
                        </View>
                      )}
                      <Text style={[styles.offerTitle, { color: theme.colors.text }]}>{info.label}</Text>
                      <Text style={[styles.offerPrice, { color: theme.colors.text }]}>
                        {bundle.toBuy.length === 0 ? 'Déjà à toi' : formatPrice(bundle.price)}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
              <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.offerCell}>
                <Pressable
                  onPress={() => navigation.navigate('Teachers')}
                  style={({ pressed }) => [styles.offerCard, { backgroundColor: theme.colors.card, transform: [{ scale: pressed ? 0.97 : 1 }], ...theme.shadow('sm') }]}
                >
                  <LinearGradient colors={OFFERS.teacher.gradient} style={styles.offerIcon}>
                    <Ionicons name={OFFERS.teacher.icon} size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.offerTitle, { color: theme.colors.text }]}>{OFFERS.teacher.label}</Text>
                  <View style={styles.faces}>
                    {teachers.slice(0, 4).map((t, idx) => (
                      <View key={t.id} style={{ marginLeft: idx === 0 ? 0 : -9 }}>
                        <Avatar uri={t.avatar} size={26} ring />
                      </View>
                    ))}
                  </View>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        )}

        {/* Promos gratuites */}
        {freeCourses.length > 0 && (
          <Animated.View entering={FadeInDown.delay(220).springify()} style={{ marginBottom: 14 }}>
            <SectionTitle title="Cours offerts" />
            <FlatList
              horizontal
              data={freeCourses}
              keyExtractor={(c) => c.id}
              showsHorizontalScrollIndicator={false}
              style={styles.bleed}
              contentContainerStyle={styles.bleedContent}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInRight.delay(240 + Math.min(index, 5) * 50).springify()}>
                  <CourseCard
                    course={item}
                    width={Math.min(270, width * 0.7)}
                    isFavorite={isFavorite(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                  />
                </Animated.View>
              )}
            />
          </Animated.View>
        )}

        {track && !loading && trackCourses.length === 0 && (
          <EmptyState icon="time-outline" title={`Les cours de ${track.shortLabel} arrivent bientôt`} />
        )}

        {/* Packs par trimestre */}
        {track && trackCourses.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <SectionTitle title={`Packs ${track.shortLabel}`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
              {terms.map((t) => {
                const active = t.number === activeTerm;
                return (
                  <Pressable
                    key={t.number}
                    onPress={() => {
                      haptics.select();
                      setTerm(t.number);
                    }}
                    style={[styles.termChip, { backgroundColor: active ? theme.colors.text : theme.colors.card, borderColor: active ? theme.colors.text : theme.colors.border }]}
                  >
                    {!t.isStarted && <Ionicons name="lock-closed" size={12} color={active ? theme.colors.background : theme.colors.textMuted} />}
                    <Text style={[styles.termChipText, { color: active ? theme.colors.background : theme.colors.text }]}>{t.label}</Text>
                    {t.isCurrent && <View style={[styles.nowDot, { backgroundColor: theme.colors.primary }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>
            {loading ? (
              <FlatList horizontal data={[1, 2]} keyExtractor={(i) => String(i)} showsHorizontalScrollIndicator={false} renderItem={() => <CourseCardSkeleton />} />
            ) : termCourses.length === 0 ? (
              <EmptyState icon="calendar-outline" title="Rien pour ce trimestre" />
            ) : (
              <FlatList
                horizontal
                data={termCourses}
                keyExtractor={(c) => c.id}
                showsHorizontalScrollIndicator={false}
                style={styles.bleed}
                contentContainerStyle={styles.bleedContent}
                renderItem={({ item, index }) => (
                  <Animated.View entering={FadeInRight.delay(Math.min(index, 5) * 50).springify()}>
                    <CourseCard
                      course={item}
                      width={Math.min(270, width * 0.7)}
                      isFavorite={isFavorite(item.id)}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                    />
                  </Animated.View>
                )}
              />
            )}
          </Animated.View>
        )}
      </ScreenContainer>

      <GradeTrackSheet
        visible={sheetOpen}
        tracks={tracks}
        currentTrack={student?.gradeTrack}
        onSelect={handleSelectTrack}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 18 },
  cartBtn: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  squaresHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  squaresTitle: { fontSize: 20.5, fontWeight: '800' },
  seeAll: { fontSize: 13.5, fontWeight: '700', marginRight: 2 },
  cartBadge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 52 },
  searchPlaceholder: { marginLeft: 10, fontSize: 14.5 },
  liveBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12 },
  liveBadgeText: { fontSize: 11.5, fontWeight: '800' },
  liveViewers: { fontSize: 11.5, fontWeight: '600' },
  liveTitle: { fontSize: 13.5, fontWeight: '700', marginTop: 2 },
  liveClose: { padding: 4, marginLeft: 6 },
  blockTitle: { fontSize: 20.5, fontWeight: '800' },
  blockSubtitle: { fontSize: 13.5, marginTop: 3, marginBottom: 14 },
  classCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 16 },
  classCode: { width: 66, height: 66, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  classCodeText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  classLevel: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  classLabel: { color: '#fff', fontSize: 16.5, fontWeight: '800', marginTop: 2 },
  classMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  classChange: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  levelCell: { width: '50%', padding: 6 },
  levelTile: { height: 118, borderRadius: 22, padding: 16, justifyContent: 'space-between' },
  levelLabel: { color: '#fff', fontSize: 17, fontWeight: '800' },
  levelSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  offerGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  offerCell: { width: '50%', padding: 6 },
  offerCard: { borderRadius: 22, padding: 14, minHeight: 168 },
  offerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  discount: { position: 'absolute', top: 14, right: 14, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { fontSize: 11.5, fontWeight: '800' },
  offerTitle: { fontSize: 14.5, fontWeight: '800' },
  offerDesc: { fontSize: 11.5, marginTop: 3, lineHeight: 15 },
  offerPrice: { fontSize: 15.5, fontWeight: '800', marginTop: 10 },
  offerCount: { fontSize: 11, marginTop: 1, fontWeight: '600' },
  faces: { flexDirection: 'row', marginTop: 12 },
  bleed: { marginHorizontal: -20, marginBottom: 12 },
  bleedContent: { paddingHorizontal: 20, paddingBottom: 6 },
  termChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5 },
  termChipText: { fontSize: 13, fontWeight: '700' },
  nowDot: { width: 7, height: 7, borderRadius: 4 },
});
