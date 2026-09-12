import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip, EmptyState } from '../../components/ui';
import { CourseLevel, Teacher } from '../../types';
import { ApiError } from '../../api/client';
import { createLesson, createCoursePdf } from '../../api/catalog';

const levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];

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
  const [level, setLevel] = useState<CourseLevel>('Débutant');
  const [videos, setVideos] = useState<string[]>([]);
  const [pdfs, setPdfs] = useState<string[]>([]);
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

  const addMockVideo = () => setVideos((v) => [...v, `Leçon ${v.length + 1}.mp4`]);
  const addMockPdf = () => setPdfs((p) => [...p, `Support ${p.length + 1}.pdf`]);

  const handlePublish = async () => {
    if (!title.trim() || !price.trim() || !activeCategoryId) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins le titre et le prix.');
      return;
    }
    if (videos.length === 0) {
      Alert.alert('Vidéo requise', 'Ajoutez au moins une vidéo de cours avant de publier — sans ça, les étudiants ne pourront rien regarder.');
      return;
    }
    setSubmitting(true);
    try {
      const category = categories.find((c) => c.id === activeCategoryId)!;
      const created = await addCourse({
        title,
        subtitle: subtitle || 'Nouveau cours',
        description: description || 'Description à venir.',
        categoryId: activeCategoryId,
        categoryName: category.name,
        price: Number(price) || 0,
        level,
        thumbnail: '',
      });

      await Promise.all(
        videos.map((v, i) =>
          createLesson(created.id, {
            title: v.replace(/\.mp4$/, ''),
            durationMinutes: 10,
            isPreview: i === 0,
            videoUrl: 'https://example.com/mock-video.mp4',
            order: i,
          })
        )
      );
      await Promise.all(
        pdfs.map((p, i) =>
          createCoursePdf(created.id, {
            title: p.replace(/\.pdf$/, ''),
            sizeMb: 2.5,
            pages: 12,
            uri: 'https://example.com/mock-support.pdf',
            order: i,
          })
        )
      );

      Alert.alert('Cours créé 🎉', 'Votre cours a été publié avec succès.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Ajouter un cours</Text>
        </View>
        <EmptyState
          icon="school-outline"
          title="Déclarez vos matières d'abord"
          description="Pour proposer un cours cohérent avec votre profil, indiquez d'abord les matières que vous enseignez."
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Ajouter un cours</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).springify()}>
        <Input label="Titre du cours" placeholder="Ex : Mathématiques Terminale Série C" icon="text-outline" value={title} onChangeText={setTitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(110).springify()}>
        <Input label="Sous-titre" placeholder="Une phrase accrocheuse" icon="chatbox-ellipses-outline" value={subtitle} onChangeText={setSubtitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <Input
          label="Description"
          placeholder="Décrivez votre cours en détail..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(190).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {selectableCategories.map((cat) => (
            <Chip key={cat.id} label={cat.name} selected={activeCategoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
          ))}
        </ScrollView>
        <Pressable onPress={() => (navigation.navigate as any)('TeacherDrawerRoot', { screen: 'TeacherProfile' })} style={{ marginBottom: 20 }}>
          <Text style={[styles.otherCategoriesLink, { color: theme.colors.textMuted }]}>
            Ce n'est pas votre matière ? <Text style={{ color: theme.colors.primary }}>Modifier mes matières</Text>
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(230).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Niveau</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {levels.map((lvl) => (
            <Chip key={lvl} label={lvl} selected={level === lvl} onPress={() => setLevel(lvl)} />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(270).springify()}>
        <Input label="Prix (UM)" placeholder="1500" icon="pricetag-outline" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(310).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Contenu du cours</Text>
        <Pressable onPress={addMockVideo} style={[styles.uploadBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="videocam-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.uploadText, { color: theme.colors.text }]}>Publier une vidéo de cours</Text>
          <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
        </Pressable>
        {videos.map((v) => (
          <Animated.View key={v} entering={ZoomIn.duration(220).springify()} style={[styles.fileRow, { backgroundColor: theme.colors.primarySoft }]}>
            <Ionicons name="play-circle-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.fileText, { color: theme.colors.primary }]}>{v}</Text>
          </Animated.View>
        ))}

        <Pressable onPress={addMockPdf} style={[styles.uploadBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 12 }]}>
          <Ionicons name="document-text-outline" size={20} color={theme.colors.danger} />
          <Text style={[styles.uploadText, { color: theme.colors.text }]}>Ajouter un support PDF</Text>
          <Ionicons name="add-circle" size={20} color={theme.colors.danger} />
        </Pressable>
        {pdfs.map((p) => (
          <Animated.View key={p} entering={ZoomIn.duration(220).springify()} style={[styles.fileRow, { backgroundColor: theme.colors.dangerLight }]}>
            <Ionicons name="document-outline" size={16} color={theme.colors.danger} />
            <Text style={[styles.fileText, { color: theme.colors.danger }]}>{p}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).springify()}>
        <Button label="Publier le cours" icon="cloud-upload-outline" onPress={handlePublish} loading={submitting} style={{ marginTop: 24 }} />
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '700', marginLeft: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  otherCategoriesLink: { fontSize: 12.5, fontWeight: '700' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed' },
  uploadText: { flex: 1, marginLeft: 12, fontSize: 13, fontWeight: '700' },
  fileRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginTop: 8 },
  fileText: { marginLeft: 8, fontSize: 12.5, fontWeight: '700' },
});
