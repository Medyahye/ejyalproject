import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { ScreenContainer } from '../../components/layout';
import { AnimatedBar, Badge, IconButton } from '../../components/ui';
import { formatPrice, formatDate, abbreviateMonth } from '../../utils/formatters';
import { Payment } from '../../types';

type Props = TeacherDrawerScreenProps<'Revenue'>;

const statusTone: Record<Payment['status'], 'success' | 'warning' | 'danger'> = {
  Réussi: 'success',
  'En attente': 'warning',
  Échoué: 'danger',
};

export const RevenueScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { payments, monthlyRevenue } = useTeacherData();

  const totalRevenue = payments.filter((p) => p.status === 'Réussi').reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'En attente').reduce((sum, p) => sum + p.amount, 0);
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Revenus</Text>
      </Animated.View>

      <FlatList
        data={payments}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View>
            <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Revenus totaux</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.secondary }]}>{formatPrice(totalRevenue)}</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>En attente</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>{formatPrice(pending)}</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).springify()} style={[styles.chartCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Revenus mensuels</Text>
              <View style={styles.chartRow}>
                {monthlyRevenue.map((m, i) => (
                  <View key={m.month} style={styles.chartBarWrap}>
                    <View style={styles.chartBarTrack}>
                      <AnimatedBar heightPercent={(m.amount / maxRevenue) * 100} color={theme.colors.secondary} delay={220 + i * 60} />
                    </View>
                    <Text style={[styles.chartLabel, { color: theme.colors.textMuted }]}>{abbreviateMonth(m.month)}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Historique des transactions</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}
            style={[styles.paymentRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.paymentIcon, { backgroundColor: theme.colors.secondarySoft }]}>
              <Ionicons name="cash-outline" size={18} color={theme.colors.secondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={1} style={[styles.paymentCourse, { color: theme.colors.text }]}>{item.courseTitle}</Text>
              <Text style={[styles.paymentStudent, { color: theme.colors.textMuted }]}>{item.studentName} · {formatDate(item.date)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.paymentAmount, { color: theme.colors.text }]}>{formatPrice(item.amount)}</Text>
              <Badge label={item.status} tone={statusTone[item.status]} small />
            </View>
          </Animated.View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '700', marginLeft: 4 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  summaryLabel: { fontSize: 11.5, fontWeight: '600', marginBottom: 8 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  chartCard: { borderRadius: 18, padding: 18, marginBottom: 24 },
  chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: 16 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110 },
  chartBarWrap: { alignItems: 'center', flex: 1 },
  chartBarTrack: { height: 80, width: 16, justifyContent: 'flex-end' },
  chartLabel: { fontSize: 9.5, marginTop: 8, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 10 },
  paymentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  paymentCourse: { fontSize: 13, fontWeight: '700' },
  paymentStudent: { fontSize: 11, marginTop: 3 },
  paymentAmount: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
});
