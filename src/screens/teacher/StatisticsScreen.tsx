import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { ScreenContainer } from '../../components/layout';
import { IconButton, ProgressBar } from '../../components/ui';
import { formatCompactNumber } from '../../utils/formatters';

type Props = TeacherDrawerScreenProps<'Statistics'>;

export const StatisticsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { myCourses, monthlyRevenue } = useTeacherData();

  const totalStudents = myCourses.reduce((sum, c) => sum + c.studentsCount, 0);
  const totalReviews = myCourses.reduce((sum, c) => sum + c.ratingCount, 0);
  const avgRating = myCourses.length ? myCourses.reduce((sum, c) => sum + c.rating, 0) / myCourses.length : 0;
  const maxStudents = Math.max(...myCourses.map((c) => c.studentsCount), 1);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    percent: star === 5 ? 62 : star === 4 ? 24 : star === 3 ? 9 : star === 2 ? 3 : 2,
  }));

  return (
    <ScreenContainer scroll edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Statistiques</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <Animated.View entering={FadeInDown.delay(80).springify()} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Ionicons name="people" size={23} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatCompactNumber(totalStudents)}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Étudiants</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(130).springify()} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Ionicons name="chatbubbles" size={23} color={theme.colors.info} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatCompactNumber(totalReviews)}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Avis reçus</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Ionicons name="star" size={23} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{avgRating.toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Note moyenne</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(240).springify()}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Répartition des notes</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          {ratingBreakdown.map((r) => (
            <View key={r.star} style={styles.ratingRow}>
              <Text style={[styles.ratingStar, { color: theme.colors.textSecondary }]}>{r.star} ★</Text>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <ProgressBar progress={r.percent / 100} color={theme.colors.accent} height={7} />
              </View>
              <Text style={[styles.ratingPercent, { color: theme.colors.textMuted }]}>{r.percent}%</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Inscriptions par package</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          {myCourses.map((c) => (
            <View key={c.id} style={{ marginBottom: 16 }}>
              <View style={styles.courseStatRow}>
                <Text numberOfLines={1} style={[styles.courseStatTitle, { color: theme.colors.text }]}>{c.title}</Text>
                <Text style={[styles.courseStatValue, { color: theme.colors.textMuted }]}>{c.studentsCount.toLocaleString('fr-FR')}</Text>
              </View>
              <ProgressBar progress={c.studentsCount / maxStudents} color={theme.colors.primary} height={7} />
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(360).springify()}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tendance mensuelle</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm'), marginBottom: 20 }]}>
          {monthlyRevenue.map((m) => (
            <View key={m.month} style={styles.trendRow}>
              <Text style={[styles.trendMonth, { color: theme.colors.textSecondary }]}>{m.month}</Text>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <ProgressBar progress={m.amount / Math.max(...monthlyRevenue.map((r) => r.amount), 1)} color={theme.colors.secondary} height={7} />
              </View>
              <Text style={[styles.trendValue, { color: theme.colors.text }]}>{formatCompactNumber(m.amount)} UM</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 22 },
  title: { fontSize: 21, fontWeight: '700', marginLeft: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: 16 },
  statValue: { fontSize: 18.5, fontWeight: '700', marginTop: 9 },
  statLabel: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  sectionTitle: { fontSize: 16.5, fontWeight: '700', marginBottom: 13 },
  card: { borderRadius: 16, padding: 17, marginBottom: 26 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  ratingStar: { fontSize: 13.5, fontWeight: '700', width: 36 },
  ratingPercent: { fontSize: 13, fontWeight: '600', width: 36, textAlign: 'right' },
  courseStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  courseStatTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  courseStatValue: { fontSize: 13.5, fontWeight: '700' },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
  trendMonth: { fontSize: 14, fontWeight: '600', width: 74 },
  trendValue: { fontSize: 14.5, fontWeight: '700' },
});
