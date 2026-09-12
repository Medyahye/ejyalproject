import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip } from '../../components/ui';
import { CourseLevel } from '../../types';
import { ApiError } from '../../api/client';

type EditRoute = RouteProp<{ EditCourse: { courseId: string } }, 'EditCourse'>;
const levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];

export const EditCourseScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<EditRoute>();
  const navigation = useNavigation();
  const { courses, updateCourse, deleteCourse } = useTeacherData();
  const { categories } = useCatalog();

  const course = courses.find((c) => c.id === route.params.courseId);
  const [title, setTitle] = useState(course?.title ?? '');
  const [subtitle, setSubtitle] = useState(course?.subtitle ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [price, setPrice] = useState(String(course?.price ?? ''));
  const [categoryId, setCategoryId] = useState(course?.categoryId ?? categories[0]?.id);
  const [level, setLevel] = useState<CourseLevel>(course?.level ?? 'Débutant');
  const [submitting, setSubmitting] = useState(false);

  if (!course) return null;

  const handleSave = async () => {
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
        level,
      });
      Alert.alert('Modifications enregistrées', 'Votre cours a été mis à jour.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Enregistrement impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer le cours', `Voulez-vous vraiment supprimer "${course.title}" ?`, [
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

  return (
    <ScreenContainer edges={['top']} scroll>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Modifier le cours</Text>
        <IconButton icon="trash-outline" onPress={handleDelete} color={theme.colors.danger} variant="ghost" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).springify()}>
        <Input label="Titre du cours" icon="text-outline" value={title} onChangeText={setTitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(110).springify()}>
        <Input label="Sous-titre" icon="chatbox-ellipses-outline" value={subtitle} onChangeText={setSubtitle} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <Input label="Description" value={description} onChangeText={setDescription} multiline />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(190).springify()}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {categories.map((cat) => (
            <Chip key={cat.id} label={cat.name} selected={categoryId === cat.id} onPress={() => setCategoryId(cat.id)} />
          ))}
        </ScrollView>
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
        <Input label="Prix (UM)" icon="pricetag-outline" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(310).springify()}>
        <Button label="Enregistrer les modifications" icon="checkmark-circle-outline" onPress={handleSave} loading={submitting} style={{ marginTop: 20 }} />
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '700', flex: 1, marginLeft: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4 },
});
