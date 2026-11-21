import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { Avatar, Badge, RatingStars, Button, IconButton, SegmentedControl } from '../../components/ui';
import { ReviewItem } from '../../components/course';
import { fetchCourseReviews } from '../../api/catalog';
import { Review } from '../../types';
import { formatPrice, formatDuration, formatDate } from '../../utils/formatters';
import { CONTENT_TYPE_INFO, TERM_LABELS } from '../../constants/offers';
import { ApiError } from '../../api/client';
import { haptics } from '../../utils/haptics';
import { StudentStackParamList } from '../../navigation/types';
import { FEATURES } from '../../constants/features';

type DetailRoute = RouteProp<{ CourseDetail: { courseId: string } }, 'CourseDetail'>;
type DetailNav = NativeStackNavigationProp<StudentStackParamList>;

type Tab = 'overview' | 'curriculum' | 'reviews';

export const CourseDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const { isFavorite, toggleFavorite, isInCart, addToCart, isPurchased, isPending, enrollmentFor, placeOrder } = useStudentData();
  const { getCourseById } = useCatalog();
  const [tab, setTab] = useState<Tab>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [claiming, setClaiming] = useState(false);
  const heartScale = useSharedValue(1);
  const heartAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const course = getCourseById(route.params.courseId);

  useEffect(() => {
    if (!course) return;
    fetchCourseReviews(course.id).then(setReviews).catch(() => setReviews([]));
  }, [course?.id]);

  if (!course) return null;

  // This screen is shared with the teacher stack, where student-only routes don't exist.
  const isStudentStack = navigation.getState()?.routeNames?.includes('TeacherProfile') ?? false;
  const owned = isPurchased(course.id);
  const pending = isPending(course.id);
  const inCart = isInCart(course.id);
  const fav = isFavorite(course.id);
  const enrollment = enrollmentFor(course.id);
  const content = CONTENT_TYPE_INFO[course.contentType] ?? CONTENT_TYPE_INFO.both;

  const handleToggleFavorite = () => {
    heartScale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    toggleFavorite(course.id);
  };

  const claimFree = async () => {
    setClaiming(true);
    try {
      await placeOrder('Bankily', 'single', [course.id]);
      haptics.success();
      Alert.alert('C\'est à toi !', 'Ce cours gratuit est maintenant dans « Mes cours ».');
    } catch (err) {
      Alert.alert('Oups', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Image source={{ uri: course.thumbnail }} style={styles.hero} />
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={styles.heroOverlayTop} />
          <Pressable style={styles.playOverlay} onPress={() => navigation.navigate('VideoPlayer', { courseId: course.id })}>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={26} color="#fff" />
            </View>
          </Pressable>
          <View style={styles.heroTopBar}>
            <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="filled" />
            <Animated.View style={heartAnimatedStyle}>
              <IconButton icon={fav ? 'heart' : 'heart-outline'} onPress={handleToggleFavorite} variant="filled" color={fav ? theme.colors.danger : theme.colors.text} />
            </Animated.View>
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            {course.isLocked && course.unlockDate && (
              <View style={[styles.lockBanner, { backgroundColor: theme.colors.backgroundAlt }]}>
                <Ionicons name="lock-closed" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.lockBannerText, { color: theme.colors.textSecondary }]}>Disponible le {formatDate(course.unlockDate)}</Text>
              </View>
            )}
            <Text style={[styles.title, { color: theme.colors.text }]}>{course.title}</Text>
            <View style={styles.badgeRow}>
              <Badge label={TERM_LABELS[course.term] ?? `T${course.term}`} tone="info" small />
              {course.isFree && <Badge label="Offert" tone="success" small />}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <Pressable
              disabled={!isStudentStack}
              onPress={() => navigation.navigate('TeacherProfile', { teacherId: course.teacherId })}
              style={[styles.teacherRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
            >
              <Avatar uri={course.teacherAvatar} size={44} />
              <Text style={[styles.teacherName, { color: theme.colors.text, flex: 1, marginLeft: 12 }]} numberOfLines={1}>{course.teacherName}</Text>
              {isStudentStack && <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />}
            </Pressable>
          </Animated.View>

          {!!course.description && (
            <Text numberOfLines={3} style={[styles.description, { color: theme.colors.textSecondary }]}>{course.description}</Text>
          )}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{course.lessons.length} leçons</Text>
          {course.lessons.map((lesson, i) => {
            const open = owned || lesson.isPreview;
            const canPdf = !!lesson.pdfUri && open && isStudentStack && !course.isLocked && course.contentType !== 'video';
            return (
              <View key={lesson.id} style={[styles.lessonRow, { borderBottomColor: theme.colors.border }]}>
                <Pressable
                  onPress={() => open && navigation.navigate('VideoPlayer', { courseId: course.id, lessonId: lesson.id })}
                  style={styles.lessonRowMain}
                >
                  <View style={[styles.lessonIndex, { backgroundColor: theme.colors.primarySoft }]}>
                    <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.lessonTitle, { color: theme.colors.text }]} numberOfLines={1}>{lesson.title}</Text>
                    <Text style={[styles.lessonMeta, { color: theme.colors.textMuted }]}>{lesson.durationMinutes} min</Text>
                  </View>
                  {canPdf && (
                    <Pressable
                      hitSlop={8}
                      onPress={() => navigation.navigate('PdfViewer', { courseId: course.id, lessonId: lesson.id, uri: lesson.pdfUri!, title: lesson.pdfTitle || lesson.title })}
                      style={styles.pdfIcon}
                    >
                      <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                    </Pressable>
                  )}
                  <Ionicons name={open ? 'play-circle-outline' : 'lock-closed-outline'} size={open ? 22 : 18} color={open ? theme.colors.primary : theme.colors.textMuted} />
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(200).springify()} style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        {!isStudentStack ? (
          <Button label="Aperçu professeur" icon="eye-outline" variant="outline" disabled />
        ) : owned ? (
          course.isLocked ? (
            <Button label={course.unlockDate ? `Disponible le ${formatDate(course.unlockDate)}` : 'Bientôt disponible'} icon="lock-closed" disabled />
          ) : (
            <Button label="Continuer le cours" icon="play" onPress={() => navigation.navigate('VideoPlayer', { courseId: course.id })} />
          )
        ) : pending ? (
          <Button label="Paiement en cours de validation" icon="hourglass-outline" variant="outline" disabled />
        ) : course.isFree ? (
          <>
            <View style={{ marginRight: 14 }}>
              <Text style={[styles.footerPrice, { color: theme.colors.primary }]}>Gratuit</Text>
              <Text style={[styles.footerOldPrice, { color: theme.colors.textMuted }]}>{formatPrice(course.price)}</Text>
            </View>
            <Button label="Obtenir gratuitement" icon="gift" loading={claiming} onPress={claimFree} fullWidth={false} style={{ flex: 1 }} />
          </>
        ) : (
          <>
            <View style={{ marginRight: 10 }}>
              <Text style={[styles.footerPrice, { color: theme.colors.text }]}>{formatPrice(course.price)}</Text>
              {!!course.originalPrice && (
                <Text style={[styles.footerOldPrice, { color: theme.colors.textMuted }]}>{formatPrice(course.originalPrice)}</Text>
              )}
            </View>
            <IconButton
              icon={inCart ? 'cart' : 'cart-outline'}
              variant="outline"
              size={50}
              color={theme.colors.primary}
              onPress={() => {
                haptics.tap();
                inCart ? navigation.navigate('Cart') : addToCart(course);
              }}
              style={{ marginRight: 10 }}
            />
            <Button
              label="Acheter"
              icon="flash"
              onPress={() => navigation.navigate('Payment', { offer: 'single', courseIds: [course.id], title: course.title })}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%', height: 280 },
  heroOverlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  heroTopBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  lockBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12, marginBottom: 14 },
  lockBannerText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
  title: { fontSize: 21, fontWeight: '700', marginBottom: 8, lineHeight: 28 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  metaDot: { marginHorizontal: 2 },
  metaText: { fontSize: 12.5, marginLeft: 4 },
  teacherRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 22 },
  teacherLabel: { fontSize: 11, fontWeight: '600' },
  teacherName: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  description: { fontSize: 13.5, lineHeight: 21, marginBottom: 8 },
  learnRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  learnText: { fontSize: 13.5, marginLeft: 10, flex: 1, lineHeight: 19 },
  pdfIcon: { padding: 4, marginRight: 8 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginTop: 12, marginBottom: 12 },
  pdfText: { flex: 1, marginLeft: 12, fontSize: 13.5, fontWeight: '700' },
  updatedText: { fontSize: 11.5, marginTop: 6 },
  lessonRow: { paddingVertical: 14, borderBottomWidth: 1 },
  lessonRowMain: { flexDirection: 'row', alignItems: 'center' },
  lessonIndex: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  lessonTitle: { fontSize: 13.5, fontWeight: '700' },
  lessonMeta: { fontSize: 11.5, marginTop: 3 },
  lessonPdfBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 40, marginTop: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, maxWidth: '80%' },
  lessonPdfText: { fontSize: 11, fontWeight: '700', marginLeft: 6 },
  ratingSummary: { alignItems: 'center', padding: 22, borderRadius: 16, marginBottom: 16 },
  ratingBig: { fontSize: 36, fontWeight: '700', marginBottom: 6 },
  ratingCountText: { fontSize: 12, marginTop: 6 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  footerPrice: { fontSize: 18, fontWeight: '700' },
  footerOldPrice: { fontSize: 12, textDecorationLine: 'line-through' },
});
