import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn, LinearTransition } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip, EmptyState } from '../../components/ui';
import { GradeTrack, Teacher } from '../../types';
import { GRADE_TRACKS } from '../../constants/gradeTracks';
import { ApiError } from '../../api/client';
import { createLesson } from '../../api/catalog';
import { haptics } from '../../utils/haptics';

interface ChapterDraft {
  id: string;
  title: string;
  hasVideo: boolean;
  hasPdf: boolean;
}

let chapterSeq = 0;
const newChapter = (index: number): ChapterDraft => ({
  id: `draft-${Date.now()}-${chapterSeq++}`,
  title: `Chapitre ${index + 1}`,
  hasVideo: false,
  hasPdf: false,
});

export const AddCourseScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const teacher = user as Teacher;
  const { addCourse, myCourses } = useTeacherData();
  const { categories } = useCatalog();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [gradeTracks, setGradeTracks] = useState<GradeTrack[]>([]);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Prefer the teacher's declared subjects; fall back to categories of courses they already published.
  const myCategoryIds = useMemo(() => {
    if (teacher?.teachingCategoryIds?.length) return teacher.teachingCategoryIds;
    return Array.from(new Set(myCourses.map((c) => c.categoryId)));
  }, [teacher?.teachingCategoryIds, myCourses]);

  // A teacher only ever creates courses within their own declared subjects — no fallback to
  // the full catalog, otherwise clearing "Mes matières" would silently reopen every category.
  const selectableCategories = useMemo(() => categories.filter((c) => myCategoryIds.includes(c.id)), [categories, myCategoryIds]);

  const activeCategoryId = categoryId ?? selectableCategories[0]?.id;

  const toggleTrack = (id: GradeTrack) => {
    haptics.select();
    setGradeTracks((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const addChapter = () => {
    haptics.tap();
    setChapters((c) => [...c, newChapter(c.length)]);
  };
  const removeChapter = (id: string) => {
    haptics.tap();
    setChapters((c) => c.filter((ch) => ch.id !== id));
  };
  const updateChapterTitle = (id: string, value: string) => {
    setChapters((c) => c.map((ch) => (ch.id === id ? { ...ch, title: value } : ch)));
  };
  const toggleChapterVideo = (id: string) => {
    haptics.select();
    setChapters((c) => c.map((ch) => (ch.id === id ? { ...ch, hasVideo: !ch.hasVideo } : ch)));
  };
  const toggleChapterPdf = (id: string) => {
    haptics.select();
    setChapters((c) => c.map((ch) => (ch.id === id ? { ...ch, hasPdf: !ch.hasPdf } : ch)));
  };

  const handlePublish = async () => {
    if (!title.trim() || !price.trim() || !activeCategoryId) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins le titre et le prix.');
      return;
    }
    if (gradeTracks.length === 0) {
      Alert.alert('Filière requise', 'Choisissez au moins une filière (C, D, LM, LO, T...) pour ce package.');
      return;
    }
    const validChapters = chapters.filter((c) => c.hasVideo);
    if (validChapters.length === 0) {
      Alert.alert('Chapitre requis', 'Ajoutez au moins un chapitre avec sa vidéo avant de publier.');
      return;
    }
    setSubmitting(true);
    try {
      const category = categories.find((c) => c.id === activeCategoryId)!;
      const created = await addCourse({
        title,
        subtitle: subtitle || 'Nouveau package',
        description: description || 'Description à venir.',
        categoryId: activeCategoryId,
        categoryName: category.name,
        price: Number(price) || 0,
        level: 'Débutant',
        thumbnail: '',
        gradeTracks,
      });

      await Promise.all(
        validChapters.map((c, i) =>
          createLesson(created.id, {
            title: c.title,
            durationMinutes: 10,
            isPreview: i === 0,
            videoUrl: 'https://example.com/mock-video.mp4',
            order: i,
            ...(c.hasPdf
              ? { pdfTitle: `${c.title} — Support`, pdfSizeMb: 2.5, pdfPages: 12, pdfUri: 'https://example.com/mock-support.pdf' }
              : {}),
          })
        )
      );

      Alert.alert('Package créé 🎉', 'Votre package a été publié avec succès.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Publication impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (myCategoryIds.length === 0) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.header}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Ajouter un package</Text>
        </View>
        <EmptyState
          icon="school-outline"
          title="Déclarez vos matières d'abord"
          description="Pour proposer un package cohérent avec votre profil, indiquez d'abord les matières que vous enseignez."
          actionLabel="Définir mes matières"
          onAction={() => (navigation.navigate as any)('TeacherDrawerRoot', { screen: 'TeacherProfile' })}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']} scroll>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Ajouter un package</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).springify()}>
        <Input label="Titre du package" placeholder="Ex : Mathématiques Terminale Série D" icon="text-outline" value={title} onChangeText={setTitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(110).springify()}>
        <Input label="Sous-titre" placeholder="Une phrase accrocheuse" icon="chatbox-ellipses-outline" value={subtitle} onChangeText={setSubtitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <Input
          label="Description"
          placeholder="Décrivez votre package en détail..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(190).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {selectableCategories.map((cat) => (
            <Chip key={cat.id} label={cat.name} selected={activeCategoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Filière(s) visée(s)</Text>
        <Text style={[styles.sectionHint, { color: theme.colors.textMuted }]}>Pour qui est fait ce package ? (plusieurs choix possibles)</Text>
        <View style={styles.trackWrap}>
          {GRADE_TRACKS.map((track) => {
            const selected = gradeTracks.includes(track.id);
            return (
              <Pressable
                key={track.id}
                onPress={() => toggleTrack(track.id)}
                style={[
                  styles.trackChip,
                  { backgroundColor: selected ? track.color : theme.colors.card, borderColor: selected ? track.color : theme.colors.border },
                ]}
              >
                <Text style={[styles.trackChipCode, { color: selected ? '#fff' : theme.colors.text }]}>{track.code}</Text>
                <Text style={[styles.trackChipLabel, { color: selected ? '#fff' : theme.colors.textMuted }]}>{track.shortLabel}</Text>
                {selected && <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 6 }} />}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).springify()}>
        <Input label="Prix (UM)" placeholder="1500" icon="pricetag-outline" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(310).springify()}>
        <View style={styles.chaptersHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text, marginTop: 4 }]}>Chapitres du package</Text>
            <Text style={[styles.sectionHint, { color: theme.colors.textMuted }]}>Chaque chapitre a sa propre vidéo et, si besoin, son PDF</Text>
          </View>
        </View>

        {chapters.map((chapter, i) => (
          <Animated.View
            key={chapter.id}
            entering={ZoomIn.duration(220).springify()}
            layout={LinearTransition.springify()}
            style={[styles.chapterCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={styles.chapterTopRow}>
              <View style={[styles.chapterIndex, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 13.5 }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Input value={chapter.title} onChangeText={(v) => updateChapterTitle(chapter.id, v)} placeholder="Ex : Les fonctions" />
              </View>
              <IconButton icon="trash-outline" onPress={() => removeChapter(chapter.id)} variant="ghost" size={34} color={theme.colors.danger} />
            </View>

            <View style={styles.chapterActionsRow}>
              <Pressable
                onPress={() => toggleChapterVideo(chapter.id)}
                style={[
                  styles.chapterActionBtn,
                  { backgroundColor: chapter.hasVideo ? theme.colors.primarySoft : theme.colors.backgroundAlt, borderColor: chapter.hasVideo ? theme.colors.primary : theme.colors.border },
                ]}
              >
                <Ionicons name={chapter.hasVideo ? 'checkmark-circle' : 'videocam-outline'} size={18} color={chapter.hasVideo ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.chapterActionText, { color: chapter.hasVideo ? theme.colors.primary : theme.colors.textMuted }]}>
                  {chapter.hasVideo ? 'Vidéo ajoutée' : 'Ajouter la vidéo'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => toggleChapterPdf(chapter.id)}
                style={[
                  styles.chapterActionBtn,
                  { backgroundColor: chapter.hasPdf ? theme.colors.dangerLight : theme.colors.backgroundAlt, borderColor: chapter.hasPdf ? theme.colors.danger : theme.colors.border },
                ]}
              >
                <Ionicons name={chapter.hasPdf ? 'checkmark-circle' : 'document-text-outline'} size={18} color={chapter.hasPdf ? theme.colors.danger : theme.colors.textMuted} />
                <Text style={[styles.chapterActionText, { color: chapter.hasPdf ? theme.colors.danger : theme.colors.textMuted }]}>
                  {chapter.hasPdf ? 'PDF ajouté' : 'PDF (optionnel)'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        ))}

        <Pressable onPress={addChapter} style={[styles.uploadBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.uploadText, { color: theme.colors.text }]}>Ajouter un chapitre</Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).springify()}>
        <Button label="Publier le package" icon="cloud-upload-outline" size="lg" onPress={handlePublish} loading={submitting} style={{ marginTop: 24 }} />
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 22 },
  title: { fontSize: 21, fontWeight: '700', marginLeft: 4 },
  sectionLabel: { fontSize: 14.5, fontWeight: '700', marginBottom: 5 },
  sectionHint: { fontSize: 13, marginBottom: 13 },
  trackWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 9 },
  trackChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1.5 },
  trackChipCode: { fontSize: 14, fontWeight: '800' },
  trackChipLabel: { fontSize: 12.5, fontWeight: '600', marginLeft: 6 },
  chaptersHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  chapterCard: { borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 11 },
  chapterTopRow: { flexDirection: 'row', alignItems: 'center' },
  chapterIndex: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  chapterActionsRow: { flexDirection: 'row', gap: 9, marginTop: 5 },
  chapterActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  chapterActionText: { fontSize: 13, fontWeight: '700', marginLeft: 7 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed' },
  uploadText: { marginLeft: 11, fontSize: 14.5, fontWeight: '700' },
});
