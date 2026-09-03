import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { ScreenContainer } from '../../components/layout';
import { Badge, Button, EmptyState, IconButton, RatingStars } from '../../components/ui';
import { formatPrice } from '../../utils/formatters';
import { Course } from '../../types';

type Props = TeacherDrawerScreenProps<'TeacherMyCourses'>;

export const TeacherMyCoursesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { myCourses, deleteCourse } = useTeacherData();

  const confirmDelete = (course: Course) => {
    Alert.alert('Supprimer le cours', `Voulez-vous vraiment supprimer "${course.title}" ? Cette action est irréversible.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteCourse(course.id) },
    ]);
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes cours ({myCourses.length})</Text>
        <IconButton icon="add" onPress={() => navigation.navigate('AddCourse')} />
      </View>

      <FlatList
        data={myCourses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <Pressable onPress={() => (navigation.navigate as any)('TeacherCourseDetail', { courseId: item.id })}>
              <Image source={{ uri: item.thumbnail }} style={styles.image} />
            </Pressable>
            <View style={styles.body}>
              <View style={styles.badgeRow}>
                <Badge label={item.categoryName} tone="primary" small />
                {item.isBestseller && <Badge label="Best-seller" tone="warning" small />}
              </View>
              <Text numberOfLines={2} style={[styles.courseTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <RatingStars rating={item.rating} size={12} count={item.ratingCount} />
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={13} color={theme.colors.textMuted} />
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{item.studentsCount.toLocaleString('fr-FR')}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={13} color={theme.colors.textMuted} />
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{formatPrice(item.price)}</Text>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => navigation.navigate('EditCourse', { courseId: item.id })}
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primarySoft }]}
                >
                  <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>Modifier</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(item)} style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}>
                  <Ionicons name="trash-outline" size={15} color={theme.colors.danger} />
                  <Text style={[styles.actionText, { color: theme.colors.danger }]}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="Aucun cours publié"
            description="Créez votre premier cours et commencez à générer des revenus."
            actionLabel="Ajouter un cours"
            onAction={() => navigation.navigate('AddCourse')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '800', flex: 1, marginLeft: 4 },
  card: { flexDirection: 'row', borderRadius: 16, marginBottom: 14, overflow: 'hidden' },
  image: { width: 100, height: '100%', minHeight: 150 },
  body: { flex: 1, padding: 12 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  courseTitle: { fontSize: 13.5, fontWeight: '700', lineHeight: 18, marginBottom: 6 },
  metaRow: { flexDirection: 'row', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { fontSize: 11.5, marginLeft: 4 },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10 },
  actionText: { fontSize: 11.5, fontWeight: '700', marginLeft: 4 },
});
