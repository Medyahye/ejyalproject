import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTeacherData } from '../../context/TeacherDataContext';
import { ScreenContainer } from '../../components/layout';
import { Avatar, Button, IconButton, SectionHeader } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { Teacher } from '../../types';
import { formatPrice, formatCompactNumber, abbreviateMonth } from '../../utils/formatters';

type Props = TeacherDrawerScreenProps<'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const teacher = user as Teacher;
  const { myCourses, payments, monthlyRevenue } = useTeacherData();

  const totalRevenue = payments.filter((p) => p.status === 'Réussi').reduce((sum, p) => sum + p.amount, 0);
  const totalStudents = myCourses.reduce((sum, c) => sum + c.studentsCount, 0);
  const avgRating = myCourses.length ? myCourses.reduce((sum, c) => sum + c.rating, 0) / myCourses.length : 0;
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  const stats: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string }> = [
    { icon: 'book-outline', label: 'Cours actifs', value: String(myCourses.length), tone: theme.colors.primary },
    { icon: 'people-outline', label: 'Étudiants', value: formatCompactNumber(totalStudents), tone: theme.colors.info },
    { icon: 'cash-outline', label: 'Revenus totaux', value: formatPrice(totalRevenue), tone: theme.colors.secondary },
    { icon: 'star-outline', label: 'Note moyenne', value: avgRating.toFixed(1), tone: theme.colors.warning },
  ];

  return (
    <ScreenContainer scroll edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <View style={{ flex: 1, marginLeft: 4 }}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Bon retour,</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{teacher?.fullName}</Text>
        </View>
        <Avatar uri={teacher?.avatar} size={44} />
      </View>

      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.revenueBanner}>
        <Text style={styles.revenueLabel}>Revenus ce mois-ci</Text>
        <Text style={styles.revenueValue}>{formatPrice(monthlyRevenue[monthlyRevenue.length - 1].amount)}</Text>
        <View style={styles.revenueTrendRow}>
          <Ionicons name="trending-up" size={14} color="#fff" />
          <Text style={styles.revenueTrend}>+12,5% par rapport au mois dernier</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <View style={[styles.statIcon, { backgroundColor: `${s.tone}1A` }]}>
              <Ionicons name={s.icon} size={18} color={s.tone} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Évolution des revenus" subtitle="6 derniers mois" onAction={() => navigation.navigate('Revenue')} />
      <View style={[styles.chartCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <View style={styles.chartRow}>
          {monthlyRevenue.map((m) => (
            <View key={m.month} style={styles.chartBarWrap}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBar,
                    { height: `${(m.amount / maxRevenue) * 100}%`, backgroundColor: theme.colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, { color: theme.colors.textMuted }]}>{abbreviateMonth(m.month)}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionHeader title="Mes cours" subtitle={`${myCourses.length} cours publiés`} onAction={() => navigation.navigate('TeacherMyCourses')} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {myCourses.slice(0, 2).map((c) => (
          <CourseListItem key={c.id} course={c} onPress={() => (navigation.navigate as any)('TeacherCourseDetail', { courseId: c.id })} />
        ))}
      </ScrollView>

      <Button label="Ajouter un nouveau cours" icon="add-circle-outline" onPress={() => navigation.navigate('AddCourse')} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  greeting: { fontSize: 12.5, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  revenueBanner: { borderRadius: 20, padding: 20, marginBottom: 20 },
  revenueLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '600' },
  revenueValue: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 6 },
  revenueTrendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  revenueTrend: { color: '#fff', fontSize: 11.5, marginLeft: 6, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', borderRadius: 16, padding: 14, marginBottom: 12 },
  statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3, fontWeight: '600' },
  chartCard: { borderRadius: 18, padding: 18, marginBottom: 24 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  chartBarWrap: { alignItems: 'center', flex: 1 },
  chartBarTrack: { height: 90, width: 18, justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 6, minHeight: 6 },
  chartLabel: { fontSize: 10, marginTop: 8, fontWeight: '700' },
});
