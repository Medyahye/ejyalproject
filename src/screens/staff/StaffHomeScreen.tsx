import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/layout';
import { Avatar } from '../../components/ui';
import { fetchOverview, StaffOverview } from '../../api/staff';
import { formatPrice } from '../../utils/formatters';

export const StaffHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [data, setData] = useState<StaffOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isDirector = user?.role === 'director';

  const load = useCallback(async () => {
    setData(await fetchOverview().catch(() => null));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const kpis: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string }> = data
    ? [
        { icon: 'people', label: 'Élèves', value: String(data.students), color: theme.colors.info },
        { icon: 'easel', label: 'Professeurs', value: `${data.teachers}${data.closedTeachers ? ` · ${data.closedTeachers} fermé(s)` : ''}`, color: theme.colors.secondary },
        { icon: 'albums', label: 'Cours', value: `${data.courses}${data.closedCourses ? ` · ${data.closedCourses} fermé(s)` : ''}`, color: theme.colors.primary },
        { icon: 'school', label: 'Abonnements actifs', value: String(data.activeEnrollments), color: theme.colors.warning },
      ]
    : [];

  return (
    <ScreenContainer
      scroll
      edges={['top']}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={[styles.roleBadge, { backgroundColor: isDirector ? '#2D1B69' : theme.colors.primarySoft }]}>
            <Ionicons name={isDirector ? 'diamond' : 'shield-checkmark'} size={12} color={isDirector ? '#FDCB6E' : theme.colors.primary} />
            <Text style={[styles.roleText, { color: isDirector ? '#FDCB6E' : theme.colors.primary }]}>{isDirector ? 'DIRECTEUR GÉNÉRAL' : 'ADMINISTRATEUR'}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{user?.fullName}</Text>
        </View>
        <Avatar uri={user?.avatar ?? ''} size={48} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).springify()}>
        <LinearGradient colors={isDirector ? ['#4432B0', '#221A54'] : theme.colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.revenue}>
          <Text style={styles.revenueLabel}>Chiffre d'affaires validé</Text>
          <Text style={styles.revenueValue}>{data ? formatPrice(data.revenue) : '…'}</Text>
          <Text style={styles.revenueSub}>Paiements WhatsApp confirmés par l'équipe</Text>
        </LinearGradient>
      </Animated.View>

      {data && data.pendingOrders > 0 && (
        <Animated.View entering={FadeInDown.delay(110).springify()}>
          <Pressable
            onPress={() => navigation.navigate('StaffOrders')}
            style={({ pressed }) => [styles.alert, { backgroundColor: theme.colors.accentLight, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          >
            <View style={[styles.alertIcon, { backgroundColor: theme.colors.warning }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.alertTitle, { color: theme.colors.text }]}>{data.pendingOrders} paiement(s) à valider</Text>
              <Text style={[styles.alertSub, { color: theme.colors.textSecondary }]}>{formatPrice(data.pendingAmount)} en attente · vérifiez les captures</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.grid}>
        {kpis.map((k, i) => (
          <Animated.View key={k.label} entering={FadeInDown.delay(140 + i * 50).springify()} style={styles.cell}>
            <View style={[styles.kpi, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <View style={[styles.kpiIcon, { backgroundColor: `${k.color}22` }]}>
                <Ionicons name={k.icon} size={18} color={k.color} />
              </View>
              <Text style={[styles.kpiValue, { color: theme.colors.text }]} numberOfLines={1}>{k.value}</Text>
              <Text style={[styles.kpiLabel, { color: theme.colors.textMuted }]}>{k.label}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Accès rapide</Text>
      {[
        { icon: 'cash-outline' as const, label: 'Valider les paiements', route: 'StaffOrders' },
        { icon: 'easel-outline' as const, label: 'Professeurs : fermer un pack, promos, %', route: 'StaffTeachers' },
        { icon: 'albums-outline' as const, label: 'Cours : visibilité, trimestre, promos', route: 'StaffCourses' },
        ...(isDirector ? [{ icon: 'diamond-outline' as const, label: 'Direction : comptes, filières, trimestres', route: 'Director' }] : []),
      ].map((l, i) => (
        <Animated.View key={l.route} entering={FadeInDown.delay(300 + i * 40).springify()}>
          <Pressable onPress={() => navigation.navigate(l.route)} style={[styles.link, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <Ionicons name={l.icon} size={20} color={theme.colors.primary} />
            <Text style={[styles.linkText, { color: theme.colors.text }]}>{l.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 18 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  roleText: { fontSize: 10.5, fontWeight: '900', letterSpacing: 0.6 },
  name: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  revenue: { borderRadius: 24, padding: 20, marginBottom: 16 },
  revenueLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },
  revenueValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 },
  revenueSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
  alert: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, marginBottom: 16 },
  alertIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 15, fontWeight: '800' },
  alertSub: { fontSize: 12.5, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 10 },
  cell: { width: '50%', padding: 6 },
  kpi: { borderRadius: 18, padding: 14 },
  kpiIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 18, fontWeight: '800' },
  kpiLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  section: { fontSize: 17, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 16, marginBottom: 10 },
  linkText: { flex: 1, fontSize: 14, fontWeight: '700' },
});
