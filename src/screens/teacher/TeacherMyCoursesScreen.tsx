import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
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
    Alert.alert('Supprimer le package', `Voulez-vous vraiment supprimer "${course.title}" ? Cette action est irréversible.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteCourse(course.id) },
    ]);
  };

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes packages ({myCourses.length})</Text>
        <IconButton icon="add" size={44} onPress={() => navigation.navigate('AddCourse')} />
      </Animated.View>

      <FlatList
        data={myCourses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 70).springify()}
            exiting={FadeOutLeft.duration(200)}
            layout={LinearTransition.springify()}
            style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <Pressable onPress={() => (navigation.navigate as any)('TeacherCourseDetail', { courseId: item.id })}>
              <Image source={{ uri: item.thumbnail }} style={styles.image} />
            </Pressable>
            <View style={styles.body}>
              <View style={styles.badgeRow}>
                <Badge label={item.categoryName} tone="primary" small />
                {item.isBestseller && <Badge label="Best-seller" tone="warning" small />}
              </View>
              <Text numberOfLines={2} style={[styles.courseTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <RatingStars rating={item.rating} size={13.5} count={item.ratingCount} />
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={15} color={theme.colors.textMuted} />
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{item.studentsCount.toLocaleString('fr-FR')}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={15} color={theme.colors.textMuted} />
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{formatPrice(item.price)}</Text>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => navigation.navigate('EditCourse', { courseId: item.id })}
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primarySoft }]}
                >
                  <Ionicons name="create-outline" size={17} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>Modifier</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(item)} style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}>
                  <Ionicons name="trash-outline" size={17} color={theme.colors.danger} />
                  <Text style={[styles.actionText, { color: theme.colors.danger }]}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="Aucun package publié"
            description="Créez votre premier package et commencez à générer des revenus."
            actionLabel="Ajouter un package"
            onAction={() => navigation.navigate('AddCourse')}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19.5, fontWeight: '700', flex: 1, marginLeft: 4 },
  card: { flexDirection: 'row', borderRadius: 16, marginBottom: 14, overflow: 'hidden' },
  image: { width: 108, height: '100%', minHeight: 160 },
  body: { flex: 1, padding: 14 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 7 },
  courseTitle: { fontSize: 15.5, fontWeight: '700', lineHeight: 20, marginBottom: 7 },
  metaRow: { flexDirection: 'row', marginTop: 9 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 18 },
  metaText: { fontSize: 13, marginLeft: 5 },
  actionsRow: { flexDirection: 'row', marginTop: 13, gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 11 },
  actionText: { fontSize: 13, fontWeight: '700', marginLeft: 5 },
});
