import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip } from '../../components/ui';
import { CourseLevel } from '../../types';
import { ApiError } from '../../api/client';

const levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];

export const AddCourseScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { addCourse } = useTeacherData();
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

  const activeCategoryId = categoryId ?? categories[0]?.id;

  const addMockVideo = () => setVideos((v) => [...v, `Leçon ${v.length + 1}.mp4`]);
  const addMockPdf = () => setPdfs((p) => [...p, `Support ${p.length + 1}.pdf`]);

  const handlePublish = async () => {
    if (!title.trim() || !price.trim() || !activeCategoryId) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins le titre et le prix.');
      return;
    }
    setSubmitting(true);
    try {
      const category = categories.find((c) => c.id === activeCategoryId)!;
      await addCourse({
        title,
        subtitle: subtitle || 'Nouveau cours',
        description: description || 'Description à venir.',
        categoryId: activeCategoryId,
        categoryName: category.name,
        price: Number(price) || 0,
        level,
        thumbnail: '',
      });
      Alert.alert('Cours créé 🎉', 'Votre cours a été publié avec succès.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Publication impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={['top']} scroll>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Ajouter un cours</Text>
      </View>

      <Input label="Titre du cours" placeholder="Ex : Mathématiques Terminale Série C" icon="text-outline" value={title} onChangeText={setTitle} />
      <Input label="Sous-titre" placeholder="Une phrase accrocheuse" icon="chatbox-ellipses-outline" value={subtitle} onChangeText={setSubtitle} />
      <Input
        label="Description"
        placeholder="Décrivez votre cours en détail..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {categories.map((cat) => (
          <Chip key={cat.id} label={cat.name} selected={activeCategoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
        ))}
      </ScrollView>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Niveau</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {levels.map((lvl) => (
          <Chip key={lvl} label={lvl} selected={level === lvl} onPress={() => setLevel(lvl)} />
        ))}
      </ScrollView>

      <Input label="Prix (UM)" placeholder="1500" icon="pricetag-outline" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Contenu du cours</Text>
      <Pressable onPress={addMockVideo} style={[styles.uploadBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Ionicons name="videocam-outline" size={20} color={theme.colors.primary} />
        <Text style={[styles.uploadText, { color: theme.colors.text }]}>Publier une vidéo de cours</Text>
        <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
      </Pressable>
      {videos.map((v) => (
        <View key={v} style={[styles.fileRow, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name="play-circle-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.fileText, { color: theme.colors.primary }]}>{v}</Text>
        </View>
      ))}

      <Pressable onPress={addMockPdf} style={[styles.uploadBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 12 }]}>
        <Ionicons name="document-text-outline" size={20} color={theme.colors.danger} />
        <Text style={[styles.uploadText, { color: theme.colors.text }]}>Ajouter un support PDF</Text>
        <Ionicons name="add-circle" size={20} color={theme.colors.danger} />
      </Pressable>
      {pdfs.map((p) => (
        <View key={p} style={[styles.fileRow, { backgroundColor: theme.colors.dangerLight }]}>
          <Ionicons name="document-outline" size={16} color={theme.colors.danger} />
          <Text style={[styles.fileText, { color: theme.colors.danger }]}>{p}</Text>
        </View>
      ))}

      <Button label="Publier le cours" icon="cloud-upload-outline" onPress={handlePublish} loading={submitting} style={{ marginTop: 24 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', marginLeft: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed' },
  uploadText: { flex: 1, marginLeft: 12, fontSize: 13, fontWeight: '700' },
  fileRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginTop: 8 },
  fileText: { marginLeft: 8, fontSize: 12.5, fontWeight: '700' },
});
