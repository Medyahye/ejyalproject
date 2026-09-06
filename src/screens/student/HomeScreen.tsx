import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { useLive } from '../../context/LiveContext';
import { ScreenContainer } from '../../components/layout';
import { SectionHeader, IconButton } from '../../components/ui';
import { CourseCard, CategoryPill } from '../../components/course';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { Student } from '../../types';

type Props = StudentTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const student = user as Student;
  const { isFavorite, toggleFavorite } = useStudentData();
  const { courses, categories, loading } = useCatalog();
  const { liveSessions } = useLive();
  const liveNow = liveSessions.find((l) => l.status === 'live');

  const featured = courses.filter((c) => c.isFeatured);
  const bestsellers = courses.filter((c) => c.isBestseller);
  const firstName = student?.fullName?.split(' ')[0] ?? 'Étudiant';

  return (
    <ScreenContainer scroll edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Bonjour {firstName} 👋</Text>
          <Text style={[styles.heading, { color: theme.colors.text }]}>Que voulez-vous apprendre ?</Text>
        </View>
        <IconButton icon="notifications-outline" onPress={() => {}} />
      </View>

      <Pressable onPress={() => navigation.navigate('Search')} style={[styles.searchBar, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <Text style={[styles.searchPlaceholder, { color: theme.colors.textMuted }]}>Rechercher un cours, un formateur...</Text>
      </Pressable>

      {liveNow && (
        <Pressable onPress={() => navigation.navigate('LiveRoom', { liveId: liveNow.id })}>
          <LinearGradient colors={liveNow.coverGradient} style={styles.liveBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.liveDotRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
            <Text style={styles.liveTitle} numberOfLines={1}>{liveNow.title}</Text>
            <Text style={styles.liveSubtitle}>{liveNow.teacherName} · {liveNow.viewersCount} spectateurs</Text>
          </LinearGradient>
        </Pressable>
      )}

      <SectionHeader title="Catégories" subtitle="Explorez par domaine" onAction={() => navigation.navigate('Explore')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
        {categories.map((cat) => (
          <CategoryPill key={cat.id} category={cat} onPress={() => navigation.navigate('Explore')} />
        ))}
      </ScrollView>

      <SectionHeader title="Cours à la une" subtitle="Sélectionnés pour vous" onAction={() => navigation.navigate('Explore')} />
      {loading ? (
        <FlatList
          horizontal
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          showsHorizontalScrollIndicator={false}
          renderItem={() => <CourseCardSkeleton />}
          style={{ marginBottom: 28 }}
        />
      ) : (
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(c) => c.id}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 28 }}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
            />
          )}
        />
      )}

      <SectionHeader title="Meilleures ventes" subtitle="Les plus populaires" onAction={() => navigation.navigate('Explore')} />
      <FlatList
        horizontal
        data={bestsellers}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
          />
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 8 },
  greeting: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  heading: { fontSize: 21, fontWeight: '800', maxWidth: 250 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, height: 50, marginBottom: 20 },
  searchPlaceholder: { marginLeft: 10, fontSize: 13.5 },
  liveBanner: { borderRadius: 18, padding: 16, marginBottom: 28 },
  liveDotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  liveBadgeText: { color: '#fff', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 },
  liveTitle: { color: '#fff', fontSize: 15.5, fontWeight: '800', marginBottom: 4 },
  liveSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});
