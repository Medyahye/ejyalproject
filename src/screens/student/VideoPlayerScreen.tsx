import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { StudentStackParamList } from '../../navigation/types';
import { ApiError } from '../../api/client';
import { formatDate } from '../../utils/formatters';
import { haptics } from '../../utils/haptics';

type PlayerRoute = RouteProp<{ VideoPlayer: { courseId: string; lessonId?: string } }, 'VideoPlayer'>;
type PlayerNav = NativeStackNavigationProp<StudentStackParamList>;

type Gate =
  | { state: 'checking' }
  | { state: 'ok'; viewsUsed: number; maxViews: number | null }
  | { state: 'blocked'; icon: keyof typeof Ionicons.glyphMap; title: string; message: string };

export const VideoPlayerScreen: React.FC = () => {
  // Screenshots and screen recordings are blocked while a course is on screen.
  usePreventScreenCapture();

  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const route = useRoute<PlayerRoute>();
  const navigation = useNavigation<PlayerNav>();
  const { setCourseProgress, isPurchased, isPending, enrollmentFor, recordView } = useStudentData();
  const { getCourseById } = useCatalog();

  const course = getCourseById(route.params.courseId);
  const enrollment = course ? enrollmentFor(course.id) : undefined;
  const owned = course ? isPurchased(course.id) : false;
  const initialIndex = useMemo(
    () => (course ? Math.max(0, course.lessons.findIndex((l) => l.id === route.params.lessonId)) : 0),
    [course, route.params.lessonId]
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [gate, setGate] = useState<Gate>({ state: 'checking' });
  const counted = useRef<Record<string, { viewsUsed: number; maxViews: number | null }>>({});
  const completed = useRef<Record<string, boolean>>({});

  const lesson = course?.lessons[activeIndex];
  const hasVideo = !!lesson?.videoUrl && course?.contentType !== 'pdf';

  const player = useVideoPlayer(null, (p) => {
    p.timeUpdateEventInterval = 1;
    // No AirPlay / casting: the video stays on the student's phone.
    p.allowsExternalPlayback = false;
  });

  const markDone = useCallback(() => {
    if (!course || !lesson || !owned || completed.current[lesson.id]) return;
    completed.current[lesson.id] = true;
    const done = Math.max(enrollment?.progress ?? 0, (activeIndex + 1) / course.lessons.length);
    setCourseProgress(course.id, done);
  }, [course, lesson, owned, enrollment?.progress, activeIndex, setCourseProgress]);

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    if (player.duration > 0 && currentTime / player.duration >= 0.95) markDone();
  });
  useEventListener(player, 'playToEnd', markDone);

  const openLesson = useCallback(
    async (index: number) => {
      if (!course) return;
      const target = course.lessons[index];
      if (!target) return;
      setActiveIndex(index);
      player.pause();

      if (!owned && !target.isPreview) {
        setGate({
          state: 'blocked',
          icon: isPending(course.id) ? 'hourglass-outline' : 'lock-closed',
          title: isPending(course.id) ? 'Paiement en cours de validation' : 'Leçon réservée aux inscrits',
          message: isPending(course.id) ? 'Ton cours s\'activera après validation.' : 'Achète ce cours pour y accéder.',
        });
        return;
      }
      if (owned && course.isLocked) {
        setGate({
          state: 'blocked',
          icon: 'calendar-outline',
          title: 'Bientôt disponible',
          message: course.unlockDate ? `Disponible le ${formatDate(course.unlockDate)}.` : 'Disponible au début du trimestre.',
        });
        return;
      }
      const start = async (viewsUsed: number, maxViews: number | null) => {
        setGate({ state: 'ok', viewsUsed, maxViews });
        if (target.videoUrl && course.contentType !== 'pdf') {
          await player.replaceAsync({ uri: target.videoUrl, metadata: { title: target.title } });
          player.play();
        }
      };
      // One viewing counted per opening of a lesson during this session.
      const already = counted.current[target.id];
      if (already) {
        await start(already.viewsUsed, already.maxViews);
        return;
      }
      setGate({ state: 'checking' });
      try {
        const res = await recordView(course.id, target.id);
        counted.current[target.id] = { viewsUsed: res.viewsUsed, maxViews: res.maxViews };
        if (res.remaining === 1) haptics.warning();
        await start(res.viewsUsed, res.maxViews);
      } catch (err) {
        haptics.error();
        setGate({
          state: 'blocked',
          icon: 'eye-off-outline',
          title: 'Limite de visionnage atteinte',
          message: err instanceof ApiError ? err.message : 'Impossible de lire cette leçon pour le moment.',
        });
      }
    },
    [course, owned, isPending, recordView, player]
  );

  useEffect(() => {
    openLesson(initialIndex === -1 ? 0 : initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  if (!course) return null;

  if (!lesson) {
    return (
      <View style={[styles.emptyWrap, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.closeAbs, { top: insets.top + 12 }]} hitSlop={10}>
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </Pressable>
        <Ionicons name="videocam-off-outline" size={40} color="rgba(255,255,255,0.5)" />
        <Text style={styles.emptyTitle}>Pas encore de leçon</Text>
      </View>
    );
  }

  const videoHeight = (width * 9) / 16;
  const maxViews = enrollment?.maxViews ?? null;
  const viewsFor = (lessonId: string) => enrollment?.lessonViews?.[lessonId] ?? 0;
  const canOpenPdf = gate.state === 'ok' && !!lesson.pdfUri && course.contentType !== 'video';
  const openPdf = () =>
    navigation.navigate('PdfViewer', { courseId: course.id, lessonId: lesson.id, uri: lesson.pdfUri!, title: lesson.pdfTitle || lesson.title });

  return (
    <View style={{ flex: 1, backgroundColor: '#0E0E13' }}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.headerBtn}>
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
        <View style={styles.row}>
          <View style={styles.shield}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.shieldText}>Protégé</Text>
          </View>
          {gate.state === 'ok' && gate.maxViews != null && (
            <View style={[styles.shield, { marginLeft: 6, backgroundColor: gate.maxViews - gate.viewsUsed <= 1 ? '#E64A4A' : 'rgba(255,255,255,0.16)' }]}>
              <Ionicons name="eye" size={12} color="#fff" />
              <Text style={styles.shieldText}>{gate.viewsUsed}/{gate.maxViews}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ width, height: videoHeight, backgroundColor: '#000' }}>
        {gate.state === 'ok' && hasVideo ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            nativeControls
            allowsPictureInPicture={false}
            fullscreenOptions={{ enable: true }}
          />
        ) : (
          <>
            <Image source={{ uri: lesson.thumbnail }} style={StyleSheet.absoluteFill} blurRadius={18} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
            {gate.state === 'checking' && (
              <View style={styles.center}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
            {gate.state === 'blocked' && (
              <Animated.View entering={FadeIn.duration(200)} style={[styles.center, { paddingHorizontal: 30 }]}>
                <View style={styles.blockIcon}>
                  <Ionicons name={gate.icon} size={26} color="#fff" />
                </View>
                <Text style={styles.blockTitle}>{gate.title}</Text>
                <Text style={styles.blockText}>{gate.message}</Text>
              </Animated.View>
            )}
            {gate.state === 'ok' && !hasVideo && (
              <Pressable onPress={openPdf} style={styles.center}>
                <View style={styles.blockIcon}>
                  <Ionicons name="document-text" size={26} color="#fff" />
                </View>
                <Text style={styles.blockTitle}>Leçon en PDF</Text>
                <Text style={styles.blockText}>Touche pour ouvrir la fiche</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      <View style={[styles.playlist, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.lessonHead}>
          <Text style={[styles.lessonTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {activeIndex + 1}. {lesson.title}
          </Text>
          {canOpenPdf && (
            <Pressable
              onPress={() => {
                haptics.tap();
                openPdf();
              }}
              style={({ pressed }) => [styles.pdfBtn, { backgroundColor: theme.colors.primarySoft, opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.pdfBtnText, { color: theme.colors.primary }]}>Fiche PDF</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={course.lessons}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item, index }) => {
            const active = index === activeIndex;
            const used = viewsFor(item.id);
            const exhausted = owned && maxViews != null && used >= maxViews && !counted.current[item.id];
            const locked = (!owned && !item.isPreview) || exhausted;
            return (
              <Pressable
                onPress={() => {
                  haptics.select();
                  openLesson(index);
                }}
                style={[styles.lessonRow, { backgroundColor: active ? theme.colors.primarySoft : 'transparent' }]}
              >
                <Ionicons
                  name={locked ? 'lock-closed-outline' : active ? 'play-circle' : 'play-circle-outline'}
                  size={22}
                  color={active ? theme.colors.primary : theme.colors.textMuted}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text numberOfLines={1} style={[styles.lessonRowText, { color: active ? theme.colors.primary : theme.colors.text }]}>
                    {index + 1}. {item.title}
                  </Text>
                  {owned && maxViews != null && (
                    <Text style={[styles.viewsText, { color: exhausted ? theme.colors.danger : theme.colors.textMuted }]}>
                      {exhausted ? 'Limite atteinte' : `${Math.max(0, maxViews - used)} vue(s) restante(s)`}
                    </Text>
                  )}
                </View>
                {!!item.pdfUri && course.contentType !== 'video' && (
                  <Ionicons name="document-text-outline" size={16} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                )}
                <Text style={[styles.lessonRowDuration, { color: theme.colors.textMuted }]}>{item.durationMinutes} min</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  emptyWrap: { flex: 1, backgroundColor: '#0E0E13', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 14 },
  closeAbs: { position: 'absolute', left: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  headerBtn: { padding: 4 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '700' },
  shield: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  shieldText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' } as const,
  blockIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  blockTitle: { color: '#fff', fontSize: 15.5, fontWeight: '800', textAlign: 'center' },
  blockText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  playlist: { flex: 1, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingTop: 16 },
  lessonHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingHorizontal: 4 },
  lessonTitle: { flex: 1, fontSize: 16, fontWeight: '800' },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  pdfBtnText: { fontSize: 13, fontWeight: '800' },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10, borderRadius: 14, marginBottom: 4 },
  lessonRowText: { fontSize: 13.5, fontWeight: '700' },
  viewsText: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  lessonRowDuration: { fontSize: 11.5, fontWeight: '600' },
});
