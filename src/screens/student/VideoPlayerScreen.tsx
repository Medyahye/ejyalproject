import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ProgressBar } from '../../components/ui';
import { getCourseById } from '../../data';
import { StudentStackParamList } from '../../navigation/types';

type PlayerRoute = RouteProp<{ VideoPlayer: { courseId: string; lessonId?: string } }, 'VideoPlayer'>;
type PlayerNav = NativeStackNavigationProp<StudentStackParamList>;

export const VideoPlayerScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<PlayerRoute>();
  const navigation = useNavigation<PlayerNav>();
  const { setCourseProgress } = useStudentData();

  const course = getCourseById(route.params.courseId);
  const initialIndex = useMemo(
    () => (course ? Math.max(0, course.lessons.findIndex((l) => l.id === route.params.lessonId)) : 0),
    [course, route.params.lessonId]
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.08);
  const [speed, setSpeed] = useState(1);

  const lesson = course?.lessons[activeIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(1, p + 0.01 * speed);
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  useEffect(() => {
    if (course && progress >= 0.98) {
      setCourseProgress(course.id, 1);
    }
  }, [progress, course, setCourseProgress]);

  if (!course || !lesson) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#0E0E13' }}>
      <View style={styles.playerArea}>
        <Image source={{ uri: lesson.thumbnail }} style={StyleSheet.absoluteFill} blurRadius={2} />
        <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />

        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </Pressable>

        <Pressable onPress={() => setIsPlaying((p) => !p)} style={styles.centerPlay}>
          <View style={styles.playCircle}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="#fff" />
          </View>
        </Pressable>

        <View style={styles.bottomControls}>
          <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
          <ProgressBar progress={progress} color="#fff" trackColor="rgba(255,255,255,0.25)" height={4} />
          <View style={styles.controlsRow}>
            <Text style={styles.timeText}>
              {Math.round(progress * lesson.durationMinutes)}:00 / {lesson.durationMinutes}:00
            </Text>
            <Pressable onPress={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}>
              <Text style={styles.speedText}>{speed}x</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.playlist, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.playlistTitle, { color: theme.colors.text }]}>{course.title}</Text>
        <FlatList
          data={course.lessons}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => {
            const active = index === activeIndex;
            return (
              <Pressable
                onPress={() => {
                  setActiveIndex(index);
                  setProgress(0.02);
                  setIsPlaying(true);
                }}
                style={[styles.lessonRow, { backgroundColor: active ? theme.colors.primarySoft : 'transparent' }]}
              >
                <Ionicons
                  name={active && isPlaying ? 'volume-high' : 'play-circle-outline'}
                  size={22}
                  color={active ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text numberOfLines={1} style={[styles.lessonRowText, { color: active ? theme.colors.primary : theme.colors.text }]}>
                  {index + 1}. {item.title}
                </Text>
                <Text style={[styles.lessonRowDuration, { color: theme.colors.textMuted }]}>{item.durationMinutes}min</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerArea: { height: 320, backgroundColor: '#000', justifyContent: 'flex-end' },
  closeBtn: { position: 'absolute', top: 50, left: 16, zIndex: 2 },
  centerPlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bottomControls: { padding: 16 },
  lessonTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: '600' },
  speedText: { color: '#fff', fontSize: 12.5, fontWeight: '800' },
  playlist: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  playlistTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginBottom: 4 },
  lessonRowText: { flex: 1, fontSize: 13.5, fontWeight: '600', marginLeft: 12 },
  lessonRowDuration: { fontSize: 11.5, fontWeight: '600' },
});
