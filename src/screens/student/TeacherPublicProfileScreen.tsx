import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useCatalog } from '../../context/CatalogContext';
import { useStudentData } from '../../context/StudentDataContext';
import { useAuth } from '../../context/AuthContext';
import { Button, EmptyState, IconButton } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { OFFERS, buildBundle, offerCourses } from '../../constants/offers';
import { formatDate, formatPrice } from '../../utils/formatters';
import { haptics } from '../../utils/haptics';
import { Student } from '../../types';


type Props = StudentStackScreenProps<'TeacherProfile'>;

export const TeacherPublicProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { getTeacher, courses, terms, categories, getTrack } = useCatalog();
  const { isFavoriteTeacher, toggleFavoriteTeacher, isPurchased, isPending, courseProgress } = useStudentData();
  const teacher = getTeacher(route.params.teacherId);
  const track = getTrack((user as Student)?.gradeTrack);

  const teacherCourses = useMemo(() => courses.filter((c) => c.teacherId === route.params.teacherId), [courses, route.params.teacherId]);
  const byTerm = useMemo(
    () => terms.map((t) => ({ term: t, items: teacherCourses.filter((c) => c.term === t.number) })).filter((g) => g.items.length > 0),
    [terms, teacherCourses]
  );
  const bundle = useMemo(
    () => buildBundle('teacher', offerCourses('teacher', courses, track, route.params.teacherId), isPurchased),
    [courses, track, route.params.teacherId, isPurchased]
  );

  if (!teacher) return null;
  const fav = isFavoriteTeacher(teacher.id);
  const subjects = categories.filter((c) => teacher.teachingCategoryIds.includes(c.id));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Image source={{ uri: teacher.avatar.replace('/150?', '/800?') }} style={{ width, height: width * 1.05 }} />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', theme.colors.background]}
            locations={[0, 0.25, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topBar}>
            <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="filled" />
            <IconButton
              icon={fav ? 'heart' : 'heart-outline'}
              color={fav ? theme.colors.danger : theme.colors.text}
              onPress={() => {
                haptics.success();
                toggleFavoriteTeacher(teacher.id);
              }}
              variant="filled"
            />
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{teacher.fullName}</Text>
            <Text style={[styles.headline, { color: theme.colors.textSecondary }]}>{teacher.headline}</Text>
            <View style={styles.statsRow}>
              {[
                { icon: 'star' as const, value: teacher.rating > 0 ? teacher.rating.toFixed(1) : '—', label: 'Note' },
                { icon: 'people' as const, value: String(teacher.totalStudents), label: 'Élèves' },
                { icon: 'albums' as const, value: String(teacher.courseCount), label: 'Packs' },
              ].map((s) => (
                <View key={s.label} style={[styles.stat, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
                  <Ionicons name={s.icon} size={16} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {teacher.isPromoActive && teacher.promoFreeUntil && (
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <View style={[styles.promo, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary }]}>
                <Text style={[styles.promoTitle, { color: theme.colors.primaryDark }]}>Tous ses cours sont offerts</Text>
                <Text style={[styles.promoSub, { color: theme.colors.textSecondary }]}>Jusqu'au {formatDate(teacher.promoFreeUntil)}</Text>
              </View>
            </Animated.View>
          )}

          {!!teacher.bio && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>À propos</Text>
              <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>{teacher.bio}</Text>
            </Animated.View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ses packs par trimestre</Text>
          {byTerm.length === 0 ? (
            <EmptyState icon="albums-outline" title="Pas encore de pack" />
          ) : (
            byTerm.map(({ term, items }, gi) => (
              <Animated.View key={term.number} entering={FadeInDown.delay(180 + gi * 60).springify()}>
                <View style={styles.termHeader}>
                  <Text style={[styles.termTitle, { color: theme.colors.text }]}>{term.label}</Text>
                  {!term.isStarted && (
                    <View style={[styles.lockPill, { backgroundColor: theme.colors.backgroundAlt }]}>
                      <Ionicons name="lock-closed" size={11} color={theme.colors.textSecondary} />
                      <Text style={[styles.lockText, { color: theme.colors.textSecondary }]}>dès le {formatDate(term.startDate)}</Text>
                    </View>
                  )}
                </View>
                {items.map((c) => (
                  <CourseListItem
                    key={c.id}
                    course={c}
                    pending={isPending(c.id)}
                    progress={isPurchased(c.id) ? courseProgress[c.id] ?? 0 : undefined}
                    onPress={() => navigation.navigate('CourseDetail', { courseId: c.id })}
                  />
                ))}
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {bundle.toBuy.length > 0 && (
        <Animated.View entering={FadeInUp.delay(250).springify()} style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <View style={{ marginRight: 14 }}>
            <Text style={[styles.footerLabel, { color: theme.colors.textMuted }]}>{bundle.toBuy.length} cours</Text>
            <Text style={[styles.footerPrice, { color: theme.colors.text }]}>{formatPrice(bundle.price)}</Text>
            {bundle.savings > 0 && (
              <Text style={[styles.footerSave, { color: theme.colors.primary }]}>-{Math.round(OFFERS.teacher.discount * 100)}% inclus</Text>
            )}
          </View>
          <Button
            label="Prendre ce prof"
            icon="flash"
            fullWidth={false}
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('Offer', { offer: 'teacher', teacherId: teacher.id })}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  content: { paddingHorizontal: 20, marginTop: -60 },
  name: { fontSize: 28, fontWeight: '900' },
  headline: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 18 },
  stat: { flex: 1, alignItems: 'center', borderRadius: 18, paddingVertical: 12 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 11.5, fontWeight: '600' },
  promo: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  promoTitle: { fontSize: 15, fontWeight: '800' },
  promoSub: { fontSize: 13, marginTop: 3, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, marginTop: 6 },
  bio: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '700' },
  termHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 10 },
  termTitle: { fontSize: 15, fontWeight: '800' },
  lockPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  lockText: { fontSize: 11, fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 30, borderTopWidth: 1 },
  footerLabel: { fontSize: 11.5, fontWeight: '600' },
  footerPrice: { fontSize: 19, fontWeight: '800' },
  footerSave: { fontSize: 11, fontWeight: '800' },
});
