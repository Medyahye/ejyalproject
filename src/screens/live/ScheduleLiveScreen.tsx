import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { useLive } from '../../context/LiveContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip } from '../../components/ui';
import { Teacher } from '../../types';
import { ApiError } from '../../api/client';
import { haptics } from '../../utils/haptics';

const DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const DURATIONS = [30, 45, 60, 90, 120];

function dateLabel(d: Date, i: number): string {
  if (i === 0) return "Aujourd'hui";
  if (i === 1) return 'Demain';
  return `${DOW[d.getDay()]} ${d.getDate()}`;
}

export const ScheduleLiveScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { courses } = useCatalog();
  const { createLiveSession } = useLive();
  const teacher = user as Teacher;
  const myCourses = courses.filter((c) => c.teacherId === teacher?.id);

  const dateOptions = useMemo(() => {
    const days: Date[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(myCourses[0]?.id);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  const selectedDate = selectedDateIndex !== null ? dateOptions[selectedDateIndex] : null;

  const previewLabel = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    const dayPart = `${DOW[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`;
    return `${dayPart} à ${selectedTime}`;
  }, [selectedDate, selectedTime]);

  const handleSchedule = async () => {
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Merci de renseigner le titre de la session.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Date et heure requises', 'Choisissez une date et un horaire pour votre session.');
      return;
    }
    const [hour, minute] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hour, minute, 0, 0);

    setSubmitting(true);
    try {
      const selectedCourse = myCourses.find((c) => c.id === selectedCourseId);
      await createLiveSession({
        title,
        description,
        courseId: selectedCourseId,
        categoryName: selectedCourse?.categoryName ?? '',
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: duration,
      });
      Alert.alert('Live planifié', `"${title}" est programmé ${previewLabel}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Planification impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={['top']} scroll>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Planifier un live</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).springify()}>
        <Input label="Titre de la session" placeholder="Ex : Session Q&A Mathématiques Terminale" icon="radio-outline" value={title} onChangeText={setTitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <Input
          label="Description"
          placeholder="Décrivez le contenu de votre session..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </Animated.View>

      {myCourses.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Package associé (optionnel)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 22 }}>
            {myCourses.map((c) => (
              <Chip key={c.id} label={c.title} selected={selectedCourseId === c.id} onPress={() => setSelectedCourseId(c.id)} />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(180).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 22 }} contentContainerStyle={{ gap: 10 }}>
          {dateOptions.map((d, i) => {
            const selected = selectedDateIndex === i;
            return (
              <Pressable
                key={i}
                onPress={() => {
                  haptics.select();
                  setSelectedDateIndex(i);
                }}
                style={[
                  styles.dateChip,
                  { backgroundColor: selected ? theme.colors.primary : theme.colors.card, borderColor: selected ? theme.colors.primary : theme.colors.border },
                ]}
              >
                <Text style={[styles.dateChipDay, { color: selected ? '#fff' : theme.colors.text }]}>{d.getDate()}</Text>
                <Text style={[styles.dateChipLabel, { color: selected ? 'rgba(255,255,255,0.9)' : theme.colors.textMuted }]}>{dateLabel(d, i)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Heure</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((t) => {
            const selected = selectedTime === t;
            return (
              <Pressable
                key={t}
                onPress={() => {
                  haptics.select();
                  setSelectedTime(t);
                }}
                style={[
                  styles.timeChip,
                  { backgroundColor: selected ? theme.colors.primary : theme.colors.card, borderColor: selected ? theme.colors.primary : theme.colors.border },
                ]}
              >
                <Text style={[styles.timeChipText, { color: selected ? '#fff' : theme.colors.text }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: 4 }]}>Durée</Text>
        <View style={styles.timeGrid}>
          {DURATIONS.map((d) => {
            const selected = duration === d;
            return (
              <Pressable
                key={d}
                onPress={() => {
                  haptics.select();
                  setDuration(d);
                }}
                style={[
                  styles.durationChip,
                  { backgroundColor: selected ? theme.colors.primary : theme.colors.card, borderColor: selected ? theme.colors.primary : theme.colors.border },
                ]}
              >
                <Text style={[styles.timeChipText, { color: selected ? '#fff' : theme.colors.text }]}>{d} min</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {previewLabel && (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.previewCard, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          <Text style={[styles.previewText, { color: theme.colors.primary }]}>Votre live sera diffusé {previewLabel}</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(340).springify()}>
        <Button label="Planifier la session" icon="checkmark-circle-outline" size="lg" onPress={handleSchedule} loading={submitting} style={{ marginTop: 14 }} />
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 22 },
  title: { fontSize: 20.5, fontWeight: '700', marginLeft: 4 },
  sectionLabel: { fontSize: 14.5, fontWeight: '700', marginBottom: 11 },
  dateChip: { width: 62, borderRadius: 16, borderWidth: 1.5, paddingVertical: 12, alignItems: 'center' },
  dateChipDay: { fontSize: 18, fontWeight: '800' },
  dateChipLabel: { fontSize: 10.5, fontWeight: '700', marginTop: 3 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 22 },
  timeChip: { borderRadius: 12, borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: 15 },
  durationChip: { borderRadius: 12, borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: 16 },
  timeChipText: { fontSize: 13.5, fontWeight: '700' },
  previewCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 8, gap: 10 },
  previewText: { flex: 1, fontSize: 13, fontWeight: '700' },
});
