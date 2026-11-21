import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip } from '../../components/ui';
import { ApiError } from '../../api/client';
import { createLesson, deleteLesson, updateLesson } from '../../api/catalog';
import { Course, Lesson } from '../../types';
import { CONTENT_TYPE_INFO } from '../../constants/offers';
import { LEVELS, tracksForLevel } from '../../constants/levels';
import { haptics } from '../../utils/haptics';

type EditRoute = RouteProp<{ EditCourse: { courseId: string } }, 'EditCourse'>;

interface LessonDraft {
  title: string;
  videoUrl: string;
  pdfTitle: string;
  pdfUri: string;
}

const toDraft = (l?: Lesson): LessonDraft => ({
  title: l?.title ?? '',
  videoUrl: l?.videoUrl ?? '',
  pdfTitle: l?.pdfTitle ?? '',
  pdfUri: l?.pdfUri ?? '',
});

export const EditCourseScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<EditRoute>();
  const navigation = useNavigation();
  const { courses, updateCourse, deleteCourse } = useTeacherData();
  const { categories, tracks, terms, refresh } = useCatalog();

  const course = courses.find((c) => c.id === route.params.courseId);
  const [title, setTitle] = useState(course?.title ?? '');
  const [subtitle, setSubtitle] = useState(course?.subtitle ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [price, setPrice] = useState(String(course?.price ?? ''));
  const [categoryId, setCategoryId] = useState(course?.categoryId ?? categories[0]?.id);
  const [term, setTerm] = useState(course?.term ?? 1);
  const [contentType, setContentType] = useState<Course['contentType']>(course?.contentType ?? 'both');
  const [gradeTracks, setGradeTracks] = useState<string[]>(course?.gradeTracks ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LessonDraft>(toDraft());
  const [savingLesson, setSavingLesson] = useState(false);

  if (!course) return null;

  const handleSave = async () => {
    if (gradeTracks.length === 0) {
      Alert.alert('Classe requise', 'Gardez au moins une classe pour ce package.');
      return;
    }
    setSubmitting(true);
    try {
      const category = categories.find((c) => c.id === categoryId)!;
      await updateCourse(course.id, {
        title,
        subtitle,
        description,
        price: Number(price) || course.price,
        categoryId,
        categoryName: category.name,
        term,
        contentType,
        gradeTracks,
      });
      haptics.success();
      Alert.alert('Modifications enregistrées', 'Votre package a été mis à jour.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Enregistrement impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer le package', `Voulez-vous vraiment supprimer "${course.title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteCourse(course.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const startEdit = (lesson?: Lesson) => {
    haptics.tap();
    setEditingId(lesson?.id ?? 'new');
    setDraft(toDraft(lesson));
  };

  const saveLesson = async () => {
    if (!draft.title.trim()) {
      Alert.alert('Titre requis', 'Donnez un titre à cette leçon.');
      return;
    }
    setSavingLesson(true);
    const payload = {
      title: draft.title.trim(),
      videoUrl: draft.videoUrl.trim(),
      pdfTitle: draft.pdfUri.trim() ? draft.pdfTitle.trim() || `${draft.title.trim()} — Support` : '',
      pdfUri: draft.pdfUri.trim(),
    };
    try {
      if (editingId === 'new') {
        await createLesson(course.id, { ...payload, durationMinutes: 10, order: course.lessons.length });
      } else if (editingId) {
        await updateLesson(editingId, payload);
      }
      await refresh();
      haptics.success();
      setEditingId(null);
    } catch (err) {
      Alert.alert('Enregistrement impossible', err instanceof ApiError ? err.message : 'Vérifiez les liens (ils doivent commencer par https://).');
    } finally {
      setSavingLesson(false);
    }
  };

  const removeLesson = (lesson: Lesson) => {
    Alert.alert('Supprimer la leçon', `Supprimer « ${lesson.title} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteLesson(lesson.id).catch(() => {});
          await refresh();
        },
      },
    ]);
  };

  const toggleTrack = (id: string) => {
    haptics.select();
    setGradeTracks((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const lessonForm = (
    <Animated.View entering={FadeInDown.springify()} style={[styles.lessonForm, { backgroundColor: theme.colors.backgroundAlt }]}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>{editingId === 'new' ? 'Nouvelle leçon' : 'Corriger / ré-importer'}</Text>
      {[
        { key: 'title' as const, label: 'Titre', icon: 'text-outline' as const, placeholder: 'Ex : Les suites numériques' },
        { key: 'videoUrl' as const, label: 'Lien de la vidéo', icon: 'videocam-outline' as const, placeholder: 'https://…' },
        { key: 'pdfUri' as const, label: 'Lien du PDF', icon: 'document-text-outline' as const, placeholder: 'https://… (optionnel)' },
        { key: 'pdfTitle' as const, label: 'Titre du PDF', icon: 'bookmark-outline' as const, placeholder: 'Optionnel' },
      ].map((f) => (
        <View key={f.key} style={[styles.field, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name={f.icon} size={16} color={theme.colors.textMuted} />
          <TextInput
            value={draft[f.key]}
            onChangeText={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
            placeholder={`${f.label} — ${f.placeholder}`}
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize={f.key === 'title' || f.key === 'pdfTitle' ? 'sentences' : 'none'}
            style={[styles.fieldInput, { color: theme.colors.text }]}
          />
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Button label="Annuler" variant="outline" size="sm" fullWidth={false} style={{ flex: 1 }} onPress={() => setEditingId(null)} />
        <Button label="Enregistrer" icon="cloud-upload-outline" size="sm" fullWidth={false} style={{ flex: 1 }} loading={savingLesson} onPress={saveLesson} />
      </View>
    </Animated.View>
  );

  return (
    <ScreenContainer edges={['top']} scroll>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Modifier le package</Text>
        <IconButton icon="trash-outline" onPress={handleDelete} color={theme.colors.danger} variant="ghost" />
      </Animated.View>

      {course.isClosed && (
        <View style={[styles.closed, { backgroundColor: theme.colors.dangerLight }]}>
          <Ionicons name="lock-closed" size={16} color={theme.colors.danger} />
          <Text style={[styles.closedText, { color: theme.colors.danger }]}>Ce pack est fermé par l'administration : il n'est plus visible par les élèves.</Text>
        </View>
      )}

      <Input label="Titre du package" icon="text-outline" value={title} onChangeText={setTitle} />
      <Input label="Sous-titre" icon="chatbox-ellipses-outline" value={subtitle} onChangeText={setSubtitle} />
      <Input label="Description" value={description} onChangeText={setDescription} multiline />

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        {categories.map((cat) => (
          <Chip key={cat.id} label={cat.name} selected={categoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
        ))}
      </ScrollView>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Trimestre</Text>
      <View style={styles.wrap}>
        {(terms.length ? terms : [1, 2, 3].map((n) => ({ number: n, label: `Trimestre ${n}` }))).map((t) => (
          <Chip key={t.number} label={`T${t.number} · ${t.label}`} selected={term === t.number} onPress={() => setTerm(t.number)} />
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Type de contenu</Text>
      <View style={styles.wrap}>
        {(Object.keys(CONTENT_TYPE_INFO) as Course['contentType'][]).map((ct) => (
          <Chip key={ct} label={CONTENT_TYPE_INFO[ct].label} selected={contentType === ct} onPress={() => setContentType(ct)} />
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Classes</Text>
      {LEVELS.map((level) => {
        const levelTracks = tracksForLevel(tracks, level.id);
        if (!levelTracks.length) return null;
        return (
          <View key={level.id} style={{ marginBottom: 8 }}>
            <Text style={[styles.levelLabel, { color: level.gradient[1] }]}>{level.label}</Text>
            <View style={styles.wrap}>
              {levelTracks.map((t) => (
                <Chip key={t.id} label={t.code} selected={gradeTracks.includes(t.id)} onPress={() => toggleTrack(t.id)} />
              ))}
            </View>
          </View>
        );
      })}

      <Input label="Prix (UM)" icon="pricetag-outline" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />

      <View style={styles.lessonsHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text, marginBottom: 2 }]}>Leçons ({course.lessons.length})</Text>
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>Une erreur ? Corrigez ou ré-importez la vidéo / le PDF</Text>
        </View>
        <IconButton icon="add" onPress={() => startEdit()} color={theme.colors.primary} variant="outline" />
      </View>
      {editingId === 'new' && lessonForm}
      {course.lessons.map((lesson, i) => (
        <Animated.View key={lesson.id} layout={LinearTransition}>
          <View style={[styles.lessonRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <View style={[styles.lessonIndex, { backgroundColor: theme.colors.primarySoft }]}>
              <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text numberOfLines={1} style={[styles.lessonTitle, { color: theme.colors.text }]}>{lesson.title}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 3 }}>
                <Text style={[styles.hint, { color: lesson.videoUrl ? theme.colors.primary : theme.colors.textMuted }]}>{lesson.videoUrl ? '● Vidéo' : '○ Pas de vidéo'}</Text>
                <Text style={[styles.hint, { color: lesson.pdfUri ? theme.colors.primary : theme.colors.textMuted }]}>{lesson.pdfUri ? '● PDF' : '○ Pas de PDF'}</Text>
              </View>
            </View>
            <Pressable hitSlop={8} onPress={() => startEdit(lesson)} style={styles.lessonAction}>
              <Ionicons name="create-outline" size={19} color={theme.colors.primary} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => removeLesson(lesson)} style={styles.lessonAction}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            </Pressable>
          </View>
          {editingId === lesson.id && lessonForm}
        </Animated.View>
      ))}

      <Button label="Enregistrer les modifications" icon="checkmark-circle-outline" size="lg" onPress={handleSave} loading={submitting} style={{ marginTop: 20 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8, marginBottom: 18 },
  title: { fontSize: 20, fontWeight: '800', flex: 1, marginLeft: 4 },
  closed: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, marginBottom: 16 },
  closedText: { flex: 1, fontSize: 12.5, fontWeight: '700' },
  sectionLabel: { fontSize: 14.5, fontWeight: '800', marginBottom: 10, marginTop: 4 },
  levelLabel: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  hint: { fontSize: 11.5, fontWeight: '600' },
  lessonsHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 10 },
  lessonIndex: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  lessonTitle: { fontSize: 13.5, fontWeight: '700' },
  lessonAction: { padding: 6, marginLeft: 4 },
  lessonForm: { borderRadius: 18, padding: 14, marginBottom: 12, gap: 8 },
  formTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  fieldInput: { flex: 1, marginLeft: 8, fontSize: 13.5 },
});
