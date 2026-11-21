import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Avatar, EmptyState } from '../../components/ui';
import { fetchStaffTeachers, StaffTeacher, updateStaffTeacher } from '../../api/staff';
import { formatDateShort, formatPrice } from '../../utils/formatters';
import { haptics } from '../../utils/haptics';
import { ApiError } from '../../api/client';

/** Promo end date one month from today, as YYYY-MM-DD. */
export function inOneMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export const StaffTeachersScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refresh: refreshCatalog } = useCatalog();
  const isDirector = user?.role === 'director';
  const [teachers, setTeachers] = useState<StaffTeacher[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setTeachers(await fetchStaffTeachers().catch(() => []));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const update = async (t: StaffTeacher, changes: Parameters<typeof updateStaffTeacher>[1]) => {
    setTeachers((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...changes } : x)));
    try {
      const saved = await updateStaffTeacher(t.id, changes);
      setTeachers((prev) => prev.map((x) => (x.id === t.id ? saved : x)));
      refreshCatalog().catch(() => {});
    } catch (err) {
      Alert.alert('Erreur', err instanceof ApiError ? err.message : 'Modification impossible.');
      load();
    }
  };

  const togglePacks = (t: StaffTeacher, open: boolean) => {
    if (open) {
      haptics.success();
      update(t, { packsClosed: false });
      return;
    }
    Alert.alert(
      'Fermer les packs ?',
      `Les cours de ${t.fullName} ne seront plus visibles ni achetables (les élèves déjà inscrits gardent leur accès).`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fermer',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            update(t, { packsClosed: true });
          },
        },
      ]
    );
  };

  const promoActive = (t: StaffTeacher) => !!t.promoFreeUntil && t.promoFreeUntil >= new Date().toISOString().slice(0, 10);

  return (
    <ScreenContainer edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Professeurs</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
        Fermer un pack en cas de désaccord, offrir ses cours{isDirector ? ', fixer son pourcentage' : ''}
      </Text>
      <FlatList
        data={teachers}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.colors.primary}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}>
            <View style={[styles.card, { backgroundColor: theme.colors.card, opacity: item.packsClosed ? 0.85 : 1, ...theme.shadow('sm') }]}>
              <View style={styles.row}>
                <Avatar uri={item.avatar} size={52} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>{item.fullName}</Text>
                  <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.textMuted }]}>{item.headline || item.email}</Text>
                </View>
                {item.packsClosed && (
                  <View style={[styles.closedPill, { backgroundColor: theme.colors.dangerLight }]}>
                    <Text style={[styles.closedPillText, { color: theme.colors.danger }]}>FERMÉ</Text>
                  </View>
                )}
              </View>

              <View style={styles.stats}>
                {[
                  { label: 'Packs', value: String(item.courseCount) },
                  { label: 'Abonnés', value: String(item.subscribers) },
                  { label: 'Ventes', value: formatPrice(item.revenue) },
                  { label: 'Sa part', value: formatPrice((item.revenue * item.revenueShare) / 100) },
                ].map((s) => (
                  <View key={s.label} style={styles.stat}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]} numberOfLines={1}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.line, { borderTopColor: theme.colors.border }]}>
                <Ionicons name="pie-chart-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Pourcentage du prof</Text>
                {isDirector ? (
                  <View style={styles.stepper}>
                    <Pressable hitSlop={8} onPress={() => update(item, { revenueShare: Math.max(0, item.revenueShare - 5) })} style={[styles.stepBtn, { backgroundColor: theme.colors.backgroundAlt }]}>
                      <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </Pressable>
                    <Text style={[styles.stepValue, { color: theme.colors.text }]}>{Math.round(item.revenueShare)}%</Text>
                    <Pressable hitSlop={8} onPress={() => update(item, { revenueShare: Math.min(100, item.revenueShare + 5) })} style={[styles.stepBtn, { backgroundColor: theme.colors.backgroundAlt }]}>
                      <Ionicons name="add" size={16} color={theme.colors.text} />
                    </Pressable>
                  </View>
                ) : (
                  <Text style={[styles.stepValue, { color: theme.colors.text }]}>{Math.round(item.revenueShare)}%</Text>
                )}
              </View>

              <View style={[styles.line, { borderTopColor: theme.colors.border }]}>
                <Ionicons name="gift-outline" size={18} color={theme.colors.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.lineLabel, { color: theme.colors.text, marginLeft: 0 }]}>Tous ses cours gratuits</Text>
                  {promoActive(item) && item.promoFreeUntil && (
                    <Text style={[styles.meta, { color: theme.colors.primary }]}>jusqu'au {formatDateShort(item.promoFreeUntil)}</Text>
                  )}
                </View>
                <Switch
                  value={promoActive(item)}
                  onValueChange={(on) => {
                    haptics.select();
                    update(item, { promoFreeUntil: on ? inOneMonth() : null });
                  }}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                />
              </View>

              <View style={[styles.line, { borderTopColor: theme.colors.border }]}>
                <Ionicons name={item.packsClosed ? 'lock-closed-outline' : 'lock-open-outline'} size={18} color={item.packsClosed ? theme.colors.danger : theme.colors.primary} />
                <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Packs ouverts</Text>
                <Switch
                  value={!item.packsClosed}
                  onValueChange={(open) => togglePacks(item, open)}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.danger }}
                />
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={<EmptyState icon="easel-outline" title="Aucun professeur" />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 16 },
  card: { borderRadius: 22, padding: 16, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  closedPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  closedPillText: { fontSize: 10.5, fontWeight: '900' },
  stats: { flexDirection: 'row', marginTop: 14, marginBottom: 6 },
  stat: { flex: 1 },
  statValue: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  line: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, marginTop: 12 },
  lineLabel: { flex: 1, fontSize: 13.5, fontWeight: '700', marginLeft: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 15, fontWeight: '900', minWidth: 42, textAlign: 'center' },
});
