import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { ScreenContainer } from '../../components/layout';
import { Button, EmptyState, SegmentedControl, Badge } from '../../components/ui';
import { decideOrder, fetchOrders, StaffOrder } from '../../api/staff';
import { formatDate, formatPrice } from '../../utils/formatters';
import { OFFERS } from '../../constants/offers';
import { haptics } from '../../utils/haptics';
import { ApiError } from '../../api/client';

type Tab = 'pending' | 'history';

export const StaffOrdersScreen: React.FC = () => {
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('pending');
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (which: Tab) => {
    const list = await fetchOrders(which === 'pending' ? 'En attente' : undefined).catch(() => []);
    setOrders(which === 'pending' ? list : list.filter((o) => o.status !== 'En attente'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(tab);
    }, [load, tab])
  );

  const decide = (order: StaffOrder, decision: 'validate' | 'reject') => {
    const verb = decision === 'validate' ? 'Valider' : 'Refuser';
    Alert.alert(
      `${verb} le paiement ?`,
      `${order.reference} · ${order.studentName}\n${formatPrice(order.amount)} via ${order.method}` +
        (decision === 'validate' ? '\n\nVérifiez d\'abord la capture reçue sur WhatsApp.' : ''),
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: verb,
          style: decision === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            setBusy(order.reference);
            try {
              await decideOrder(order.reference, decision);
              decision === 'validate' ? haptics.success() : haptics.warning();
              setOrders((prev) => prev.filter((o) => o.reference !== order.reference));
            } catch (err) {
              Alert.alert('Erreur', err instanceof ApiError ? err.message : 'Action impossible.');
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  const statusTone = (s: StaffOrder['status']) => (s === 'Réussi' ? 'success' : s === 'Échoué' ? 'danger' : 'warning');

  return (
    <ScreenContainer edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Paiements</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Comparez la référence avec la capture reçue sur WhatsApp</Text>
      <View style={{ marginBottom: 14 }}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { id: 'pending', label: 'À valider' },
            { id: 'history', label: 'Historique' },
          ]}
        />
      </View>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.reference}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.colors.primary}
            onRefresh={async () => {
              setRefreshing(true);
              await load(tab);
              setRefreshing(false);
            }}
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify()} exiting={FadeOut} layout={LinearTransition}>
            <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <View style={styles.topRow}>
                <Text style={[styles.ref, { color: theme.colors.text }]}>{item.reference}</Text>
                <Badge label={item.status} tone={statusTone(item.status)} small />
              </View>
              <Text style={[styles.student, { color: theme.colors.text }]}>{item.studentName}</Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{item.studentEmail} · {formatDate(item.date)}</Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amount, { color: theme.colors.text }]}>{formatPrice(item.amount)}</Text>
                <View style={[styles.method, { backgroundColor: theme.colors.backgroundAlt }]}>
                  <Ionicons name="phone-portrait-outline" size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.methodText, { color: theme.colors.textSecondary }]}>{item.method}</Text>
                </View>
                {item.offer !== 'single' && (
                  <View style={[styles.method, { backgroundColor: theme.colors.primarySoft }]}>
                    <Text style={[styles.methodText, { color: theme.colors.primary }]}>{OFFERS[item.offer as keyof typeof OFFERS]?.label ?? item.offer}</Text>
                  </View>
                )}
              </View>
              {item.courses.map((c) => (
                <View key={c.id} style={styles.courseRow}>
                  <Ionicons name="book-outline" size={13} color={theme.colors.textMuted} />
                  <Text numberOfLines={1} style={[styles.courseText, { color: theme.colors.textSecondary }]}>{c.title}</Text>
                  <Text style={[styles.courseText, { color: theme.colors.textMuted, flex: 0 }]}>{formatPrice(c.amount)}</Text>
                </View>
              ))}
              {item.status === 'En attente' && (
                <View style={styles.actions}>
                  <Button label="Refuser" variant="outline" size="sm" fullWidth={false} style={{ flex: 1 }} disabled={busy === item.reference} onPress={() => decide(item, 'reject')} />
                  <Button label="Valider" icon="checkmark" size="sm" fullWidth={false} style={{ flex: 1 }} loading={busy === item.reference} onPress={() => decide(item, 'validate')} />
                </View>
              )}
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={tab === 'pending' ? 'checkmark-done-outline' : 'receipt-outline'}
            title={tab === 'pending' ? 'Tout est à jour' : 'Aucun paiement'}
            description={tab === 'pending' ? 'Aucun paiement en attente de validation.' : 'L\'historique des paiements apparaîtra ici.'}
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 14 },
  card: { borderRadius: 20, padding: 16, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ref: { fontSize: 16, fontWeight: '900', letterSpacing: 0.6 },
  student: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  meta: { fontSize: 12, marginTop: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 8, flexWrap: 'wrap' },
  amount: { fontSize: 20, fontWeight: '900' },
  method: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  methodText: { fontSize: 11.5, fontWeight: '700' },
  courseRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  courseText: { flex: 1, fontSize: 12.5 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
