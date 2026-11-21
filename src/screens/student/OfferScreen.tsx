import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { useStudentData } from '../../context/StudentDataContext';
import { Button, EmptyState, IconButton } from '../../components/ui';
import { CourseListItem } from '../../components/course';
import { OFFERS, buildBundle, offerCourses } from '../../constants/offers';
import { formatPrice } from '../../utils/formatters';
import { haptics } from '../../utils/haptics';
import { ApiError } from '../../api/client';
import { OfferType, Student } from '../../types';

type Props = StudentStackScreenProps<'Offer'>;

export const OfferScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { offer, teacherId } = route.params;
  const { courses, terms, getTrack, getTeacher, settings } = useCatalog();
  const { isPurchased, isPending, placeOrder } = useStudentData();
  const [claiming, setClaiming] = useState(false);
  const track = getTrack((user as Student)?.gradeTrack);
  const teacher = getTeacher(teacherId);
  const info = OFFERS[offer as Exclude<OfferType, 'single'>];

  const list = useMemo(() => offerCourses(offer, courses, track, teacherId), [offer, courses, track, teacherId]);
  const bundle = useMemo(() => buildBundle(offer, list, isPurchased), [offer, list, isPurchased]);
  const groups = useMemo(
    () => terms.map((t) => ({ term: t, items: list.filter((c) => c.term === t.number) })).filter((g) => g.items.length > 0),
    [terms, list]
  );
  const maxViews = offer === 'teacher' ? settings?.teacherOfferMaxViews ?? 2 : settings?.defaultMaxViews ?? 4;
  const title = offer === 'teacher' && teacher ? `Pack ${teacher.fullName.split(' ')[0]}` : info.label;
  const toOrder = [...bundle.toBuy, ...bundle.freeCourses].filter((c) => !isPending(c.id));

  const claimFree = async () => {
    setClaiming(true);
    try {
      await placeOrder('Bankily', offer, bundle.freeCourses.map((c) => c.id));
      haptics.success();
      Alert.alert('C\'est à toi !', 'Les cours gratuits ont été ajoutés à « Mes cours ».', [
        { text: 'Voir mes cours', onPress: () => navigation.navigate('StudentTabs', { screen: 'MyCourses' }) },
      ]);
    } catch (err) {
      Alert.alert('Oups', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <LinearGradient colors={info.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <IconButton icon="close" onPress={() => navigation.goBack()} variant="filled" style={{ alignSelf: 'flex-start' }} />
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.heroIcon}>
            <Ionicons name={info.icon} size={30} color="#fff" />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(100).springify()} style={styles.heroTitle}>{title}</Animated.Text>
          <View style={styles.perks}>
            {[
              { icon: 'pricetag' as const, text: bundle.toBuy.length > 1 ? `-${Math.round(info.discount * 100)}% sur le pack` : 'Meilleur prix' },
            ].map((p) => (
              <View key={p.text} style={styles.perk}>
                <Ionicons name={p.icon} size={13} color="#fff" />
                <Text style={styles.perkText}>{p.text}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {list.length === 0 ? (
            <EmptyState icon="albums-outline" title="Aucun cours pour l'instant" />
          ) : (
            groups.map(({ term, items }, gi) => (
              <Animated.View key={term.number} entering={FadeInDown.delay(160 + gi * 70).springify()}>
                <View style={styles.termRow}>
                  <Text style={[styles.termTitle, { color: theme.colors.text }]}>{term.label}</Text>
                  <Text style={[styles.termMeta, { color: theme.colors.textMuted }]}>{items.length} cours</Text>
                </View>
                {items.map((c) => (
                  <CourseListItem
                    key={c.id}
                    course={c}
                    pending={isPending(c.id)}
                    onPress={() => navigation.navigate('CourseDetail', { courseId: c.id })}
                    rightAccessory={
                      isPurchased(c.id) ? (
                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                      ) : c.isFree ? (
                        <Text style={[styles.free, { color: theme.colors.primary }]}>Offert</Text>
                      ) : undefined
                    }
                  />
                ))}
              </Animated.View>
            ))
          )}

          {bundle.toBuy.length > 0 && (
            <View style={[styles.summary, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <View style={styles.sumRow}>
                <Text style={[styles.sumLabel, { color: theme.colors.textSecondary }]}>{bundle.toBuy.length} cours au prix normal</Text>
                <Text style={[styles.sumValue, { color: theme.colors.textSecondary }]}>{formatPrice(bundle.basePrice)}</Text>
              </View>
              {bundle.savings > 0 && (
                <View style={styles.sumRow}>
                  <Text style={[styles.sumLabel, { color: theme.colors.primary }]}>Remise pack</Text>
                  <Text style={[styles.sumValue, { color: theme.colors.primary }]}>-{formatPrice(bundle.savings)}</Text>
                </View>
              )}
              {bundle.freeCourses.length > 0 && (
                <View style={styles.sumRow}>
                  <Text style={[styles.sumLabel, { color: theme.colors.primary }]}>{bundle.freeCourses.length} cours offerts (promo)</Text>
                  <Text style={[styles.sumValue, { color: theme.colors.primary }]}>0 UM</Text>
                </View>
              )}
              <View style={[styles.sumRow, styles.sumTotal, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total</Text>
                <Text style={[styles.totalValue, { color: theme.colors.text }]}>{formatPrice(bundle.price)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {(bundle.toBuy.length > 0 || bundle.freeCourses.length > 0) && (
        <Animated.View entering={FadeInUp.delay(220).springify()} style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          {bundle.toBuy.length > 0 ? (
            <Button
              label={`Payer ${formatPrice(bundle.price)}`}
              icon="logo-whatsapp"
              size="lg"
              disabled={toOrder.length === 0}
              onPress={() => navigation.navigate('Payment', { offer, courseIds: toOrder.map((c) => c.id), title })}
            />
          ) : (
            <Button label="Obtenir gratuitement" icon="gift" size="lg" loading={claiming} onPress={claimFree} />
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hero: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  heroTitle: { color: '#fff', fontSize: 27, fontWeight: '900', marginTop: 14 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4, lineHeight: 20 },
  perks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  perkText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
  content: { padding: 20 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, marginTop: 4 },
  termTitle: { fontSize: 16, fontWeight: '800' },
  termMeta: { fontSize: 12, fontWeight: '600' },
  free: { fontSize: 13, fontWeight: '800', alignSelf: 'flex-start' },
  summary: { borderRadius: 20, padding: 16, marginTop: 8 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: 13.5, fontWeight: '600' },
  sumValue: { fontSize: 13.5, fontWeight: '700' },
  sumTotal: { borderTopWidth: 1, paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 30, borderTopWidth: 1 },
});
