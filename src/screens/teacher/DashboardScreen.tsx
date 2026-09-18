import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Avatar, AnimatedBar, AnimatedNumber, IconButton, SectionHeader } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { TeachingSubjectsSheet } from '../../components/teacher/TeachingSubjectsSheet';
import { Teacher } from '../../types';
import { formatPrice, formatCompactNumber, abbreviateMonth } from '../../utils/formatters';
import { FEATURES } from '../../constants/features';

type Props = TeacherDrawerScreenProps<'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const teacher = user as Teacher;
  const { myCourses, payments, monthlyRevenue } = useTeacherData();
  const { categories } = useCatalog();
  const [subjectsSheetOpen, setSubjectsSheetOpen] = React.useState(false);
  const teachingCategories = categories.filter((c) => teacher?.teachingCategoryIds?.includes(c.id));

  const handleSaveSubjects = (ids: string[]) => {
    updateProfile({ teachingCategoryIds: ids } as Partial<Teacher>);
    setSubjectsSheetOpen(false);
  };

  const totalRevenue = payments.filter((p) => p.status === 'Réussi').reduce((sum, p) => sum + p.amount, 0);
  const totalStudents = myCourses.reduce((sum, c) => sum + c.studentsCount, 0);
  const avgRating = myCourses.length ? myCourses.reduce((sum, c) => sum + c.rating, 0) / myCourses.length : 0;
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  const stats: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string }> = [
    { icon: 'book-outline', label: 'Packages actifs', value: String(myCourses.length), tone: theme.colors.primary },
    { icon: 'people-outline', label: 'Étudiants', value: formatCompactNumber(totalStudents), tone: theme.colors.info },
    { icon: 'cash-outline', label: 'Revenus totaux', value: formatPrice(totalRevenue), tone: theme.colors.secondary },
    { icon: 'star-outline', label: 'Note moyenne', value: avgRating.toFixed(1), tone: theme.colors.warning },
  ];

  return (
    <View style={{ flex: 1 }}>
    <ScreenContainer scroll edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <View style={{ flex: 1, marginLeft: 4 }}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Bon retour,</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{teacher?.fullName}</Text>
        </View>
        <Avatar uri={teacher?.avatar} size={48} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(30).springify()}>
        <Pressable
          onPress={() => navigation.navigate('AddCourse')}
          style={({ pressed }) => [styles.quickAddBtn, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.9 : 1, ...theme.shadow('sm') }]}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.quickAddText}>Ajouter un nouveau package</Text>
        </Pressable>
      </Animated.View>

      {teachingCategories.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <Pressable
            onPress={() => setSubjectsSheetOpen(true)}
            style={[styles.subjectsPill, { backgroundColor: theme.colors.primarySoft }]}
          >
            <Ionicons name="school-outline" size={17} color={theme.colors.primary} />
            <Text style={[styles.subjectsPillLabel, { color: theme.colors.primary }]} numberOfLines={1}>
              {teachingCategories.map((c) => c.name).join(' · ')}
            </Text>
            <Text style={[styles.subjectsPillChange, { color: theme.colors.primary }]}>Modifier</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <Pressable
            onPress={() => setSubjectsSheetOpen(true)}
            style={[styles.subjectsCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.subjectsCardIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="school-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.subjectsCardTitle, { color: theme.colors.text }]}>Quelles matières enseignez-vous ?</Text>
              <Text style={[styles.subjectsCardSubtitle, { color: theme.colors.textMuted }]}>On personnalisera les catégories proposées pour vos packages</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(80).springify()}>
        <LinearGradient colors={theme.colors.gradientPrimary} style={styles.revenueBanner}>
          <Text style={styles.revenueLabel}>Revenus ce mois-ci</Text>
          <AnimatedNumber
            value={monthlyRevenue[monthlyRevenue.length - 1].amount}
            formatter={formatPrice}
            style={styles.revenueValue}
          />
          <View style={styles.revenueTrendRow}>
            <Ionicons name="trending-up" size={16} color="#fff" />
            <Text style={styles.revenueTrend}>+12,5% par rapport au mois dernier</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <Animated.View
            key={s.label}
            entering={FadeInDown.delay(140 + i * 60).springify()}
            style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.statIcon, { backgroundColor: `${s.tone}1A` }]}>
              <Ionicons name={s.icon} size={21} color={s.tone} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{s.label}</Text>
          </Animated.View>
        ))}
      </View>

      {FEATURES.revenueChart && (
        <Animated.View entering={FadeInDown.delay(360).springify()}>
          <SectionHeader title="Évolution des revenus" subtitle="6 derniers mois" onAction={() => navigation.navigate('Revenue')} />
          <View style={[styles.chartCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <View style={styles.chartRow}>
              {monthlyRevenue.map((m, i) => (
                <View key={m.month} style={styles.chartBarWrap}>
                  <View style={styles.chartBarTrack}>
                    <AnimatedBar heightPercent={(m.amount / maxRevenue) * 100} color={theme.colors.primary} delay={400 + i * 60} />
                  </View>
                  <Text style={[styles.chartLabel, { color: theme.colors.textMuted }]}>{abbreviateMonth(m.month)}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(420).springify()}>
        <SectionHeader title="Mes packages" subtitle={`${myCourses.length} packages publiés`} onAction={() => navigation.navigate('TeacherMyCourses')} />
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {myCourses.slice(0, 2).map((c) => (
            <CourseListItem key={c.id} course={c} onPress={() => (navigation.navigate as any)('TeacherCourseDetail', { courseId: c.id })} />
          ))}
        </ScrollView>
      </Animated.View>
    </ScreenContainer>

    <TeachingSubjectsSheet
      key={(teacher?.teachingCategoryIds ?? []).join(',')}
      visible={subjectsSheetOpen}
      categories={categories}
      currentIds={teacher?.teachingCategoryIds ?? []}
      onSave={handleSaveSubjects}
      onClose={() => setSubjectsSheetOpen(false)}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 18 },
  greeting: { fontSize: 14, fontWeight: '600' },
  name: { fontSize: 20.5, fontWeight: '700', marginTop: 3 },
  quickAddBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14, marginBottom: 20 },
  quickAddText: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  subjectsPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 18, maxWidth: '100%' },
  subjectsPillLabel: { fontSize: 13.5, fontWeight: '700', marginLeft: 7, flexShrink: 1 },
  subjectsPillChange: { fontSize: 12.5, fontWeight: '700', marginLeft: 9, textDecorationLine: 'underline' },
  subjectsCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 18 },
  subjectsCardIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  subjectsCardTitle: { fontSize: 15, fontWeight: '700' },
  subjectsCardSubtitle: { fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  revenueBanner: { borderRadius: 20, padding: 22, marginBottom: 22 },
  revenueLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  revenueValue: { color: '#fff', fontSize: 33, fontWeight: '700', marginTop: 6 },
  revenueTrendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  revenueTrend: { color: '#fff', fontSize: 12.5, marginLeft: 6, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 26 },
  statCard: { width: '48%', borderRadius: 16, padding: 16, marginBottom: 12 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12.5, marginTop: 4, fontWeight: '600' },
  chartCard: { borderRadius: 18, padding: 18, marginBottom: 24 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  chartBarWrap: { alignItems: 'center', flex: 1 },
  chartBarTrack: { height: 90, width: 18, justifyContent: 'flex-end' },
  chartLabel: { fontSize: 11.5, marginTop: 8, fontWeight: '700' },
});
