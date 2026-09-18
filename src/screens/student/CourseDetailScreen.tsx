import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
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
import { StudentStackParamList } from '../../navigation/types';
import { FEATURES } from '../../constants/features';

type DetailRoute = RouteProp<{ CourseDetail: { courseId: string } }, 'CourseDetail'>;
type DetailNav = NativeStackNavigationProp<StudentStackParamList>;

type Tab = 'overview' | 'curriculum' | 'reviews';

export const CourseDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const { isFavorite, toggleFavorite, isInCart, addToCart, isPurchased } = useStudentData();
  const { getCourseById } = useCatalog();
  const [tab, setTab] = useState<Tab>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);

  const course = getCourseById(route.params.courseId);

  useEffect(() => {
    if (!course) return;
    fetchCourseReviews(course.id).then(setReviews).catch(() => setReviews([]));
  }, [course?.id]);

  if (!course) return null;

  const owned = isPurchased(course.id);
  const inCart = isInCart(course.id);
  const fav = isFavorite(course.id);

  const heartScale = useSharedValue(1);
  const handleToggleFavorite = () => {
    heartScale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    toggleFavorite(course.id);
  };
  const heartAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

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
            <View style={styles.badgeRow}>
              <Badge label={course.categoryName} tone="primary" small />
              {course.isBestseller && <Badge label="Best-seller" tone="warning" small />}
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>{course.title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{course.subtitle}</Text>

            <View style={styles.metaRow}>
              <RatingStars rating={course.rating} size={13} count={course.ratingCount} />
              <Text style={[styles.metaDot, { color: theme.colors.textMuted }]}> · </Text>
              <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{course.studentsCount.toLocaleString('fr-FR')} inscrits</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <Pressable style={[styles.teacherRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <Avatar uri={course.teacherAvatar} size={44} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.teacherLabel, { color: theme.colors.textMuted }]}>Formateur</Text>
                <Text style={[styles.teacherName, { color: theme.colors.text }]}>{course.teacherName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(170).springify()} style={{ marginBottom: 20 }}>
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={[
                { id: 'overview', label: 'Aperçu' },
                { id: 'curriculum', label: 'Programme' },
                { id: 'reviews', label: `Avis (${reviews.length})` },
              ]}
            />
          </Animated.View>

          {tab === 'overview' && (
            <Animated.View entering={FadeInDown.duration(220)}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{course.description}</Text>

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ce que vous apprendrez</Text>
              {course.whatYouWillLearn.map((item, i) => (
                <View key={i} style={styles.learnRow}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.secondary} />
                  <Text style={[styles.learnText, { color: theme.colors.textSecondary }]}>{item}</Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prérequis</Text>
              {course.requirements.map((item, i) => (
                <View key={i} style={styles.learnRow}>
                  <Ionicons name="ellipse" size={6} color={theme.colors.textMuted} style={{ marginTop: 7 }} />
                  <Text style={[styles.learnText, { color: theme.colors.textSecondary }]}>{item}</Text>
                </View>
              ))}

              {FEATURES.pdfLibrary && (
                <Pressable
                  onPress={() => navigation.navigate('PdfLibrary', { courseId: course.id })}
                  style={[styles.pdfRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
                >
                  <Ionicons name="document-text-outline" size={22} color={theme.colors.danger} />
                  <Text style={[styles.pdfText, { color: theme.colors.text }]}>{course.pdfs.length} supports PDF disponibles</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </Pressable>
              )}

              <Text style={[styles.updatedText, { color: theme.colors.textMuted }]}>Dernière mise à jour le {formatDate(course.lastUpdated)}</Text>
            </Animated.View>
          )}

          {tab === 'curriculum' && (
            <Animated.View entering={FadeInDown.duration(220)}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {course.lessons.length} leçons · {formatDuration(course.durationHours)} au total
              </Text>
              {course.lessons.map((lesson, i) => (
                <View key={lesson.id} style={[styles.lessonRow, { borderBottomColor: theme.colors.border }]}>
                  <Pressable
                    onPress={() => (owned || lesson.isPreview) && navigation.navigate('VideoPlayer', { courseId: course.id, lessonId: lesson.id })}
                    style={styles.lessonRowMain}
                  >
                    <View style={[styles.lessonIndex, { backgroundColor: theme.colors.primarySoft }]}>
                      <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>{lesson.title}</Text>
                      <Text style={[styles.lessonMeta, { color: theme.colors.textMuted }]}>{lesson.durationMinutes} min</Text>
                    </View>
                    {owned || lesson.isPreview ? (
                      <Ionicons name="play-circle-outline" size={22} color={theme.colors.primary} />
                    ) : (
                      <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
                    )}
                  </Pressable>
                  {lesson.pdfUri && (owned || lesson.isPreview) && (
                    <Pressable style={[styles.lessonPdfBtn, { backgroundColor: theme.colors.dangerLight }]}>
                      <Ionicons name="document-text-outline" size={14} color={theme.colors.danger} />
                      <Text style={[styles.lessonPdfText, { color: theme.colors.danger }]} numberOfLines={1}>
                        {lesson.pdfTitle || 'Support PDF'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </Animated.View>
          )}

          {tab === 'reviews' && (
            <Animated.View entering={FadeInDown.duration(220)}>
              <View style={[styles.ratingSummary, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
                <Text style={[styles.ratingBig, { color: theme.colors.text }]}>{course.rating.toFixed(1)}</Text>
                <RatingStars rating={course.rating} showValue={false} size={16} />
                <Text style={[styles.ratingCountText, { color: theme.colors.textMuted }]}>{course.ratingCount.toLocaleString('fr-FR')} avis</Text>
              </View>
              {reviews.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(200).springify()} style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        {owned ? (
          <Button label="Continuer le cours" icon="play" onPress={() => navigation.navigate('VideoPlayer', { courseId: course.id })} />
        ) : (
          <>
            <View style={{ marginRight: 14 }}>
              <Text style={[styles.footerPrice, { color: theme.colors.text }]}>{formatPrice(course.price)}</Text>
              {course.originalPrice && (
                <Text style={[styles.footerOldPrice, { color: theme.colors.textMuted }]}>{formatPrice(course.originalPrice)}</Text>
              )}
            </View>
            <Button
              label={inCart ? 'Voir le panier' : 'Ajouter au panier'}
              icon={inCart ? 'cart' : 'cart-outline'}
              onPress={() => (inCart ? navigation.navigate('Cart') : addToCart(course))}
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
  hero: { width: '100%', height: 240 },
  heroOverlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  heroTopBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 240, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  badgeRow: { flexDirection: 'row', marginBottom: 12 },
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
