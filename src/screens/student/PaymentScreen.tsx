import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Button, IconButton } from '../../components/ui';
import { formatPrice } from '../../utils/formatters';
import { StudentStackParamList } from '../../navigation/types';
import { Course, OfferType, Payment } from '../../types';
import { OrderResult } from '../../api/commerce';
import { ApiError } from '../../api/client';
import { haptics } from '../../utils/haptics';
import { buildBundle } from '../../constants/offers';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type PaymentRoute = RouteProp<StudentStackParamList, 'Payment'>;
type Method = Payment['method'];

interface MethodInfo {
  id: Method;
  label: string;
  sublabel: string;
  logo: number;
}

const METHODS: MethodInfo[] = [
  { id: 'Bankily', label: 'Bankily', sublabel: 'Banque Populaire de Mauritanie', logo: require('../../../assets/payments/bankily.jpg') },
  { id: 'Masrvi', label: 'Masrvi', sublabel: 'BMCI', logo: require('../../../assets/payments/masrvi.png') },
  { id: 'Sedad', label: 'Sedad', sublabel: 'BMI', logo: require('../../../assets/payments/sedad.png') },
  { id: 'Click', label: 'Click', sublabel: 'BNM', logo: require('../../../assets/payments/click.jpg') },
];

function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
}

export const PaymentScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<PaymentRoute>();
  const { user } = useAuth();
  const { cartItems, placeOrder, isPurchased } = useStudentData();
  const { getCourseById, settings } = useCatalog();
  const [method, setMethod] = useState<MethodInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);

  const offer: OfferType = route.params?.offer ?? 'single';
  const orderCourses: Course[] = useMemo(() => {
    if (route.params?.courseIds) {
      return route.params.courseIds.map((id) => getCourseById(id)).filter((c): c is Course => !!c);
    }
    return cartItems.map((i) => i.course);
  }, [route.params?.courseIds, cartItems, getCourseById]);
  const bundle = useMemo(() => buildBundle(offer, orderCourses, isPurchased), [offer, orderCourses, isPurchased]);
  const amount = bundle.price;
  const title = route.params?.title ?? (orderCourses.length === 1 ? orderCourses[0].title : `${orderCourses.length} cours`);
  const merchantNumber = method ? settings?.merchantNumbers?.[method.id] ?? '' : '';

  const buildMessage = (result: OrderResult) =>
    [
      `Bonjour, voici la capture de mon paiement.`,
      `Référence : ${result.reference}`,
      `Nom : ${user?.fullName ?? ''}`,
      `Email : ${user?.email ?? ''}`,
      `Montant : ${formatPrice(result.amount)} via ${result.method}`,
      `Commande : ${title}`,
    ].join('\n');

  const openWhatsapp = async (result: OrderResult) => {
    const url = whatsappLink(result.whatsappNumber, buildMessage(result));
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('WhatsApp introuvable', `Envoie ta capture au ${result.whatsappNumber} avec la référence ${result.reference}.`);
    }
  };

  const confirm = async () => {
    if (!method) return;
    setProcessing(true);
    try {
      const result = await placeOrder(method.id, offer, route.params?.courseIds);
      setMethod(null);
      setOrder(result);
      haptics.success();
      if (result.status === 'pending') await openWhatsapp(result);
    } catch (err) {
      Alert.alert('Commande impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setProcessing(false);
    }
  };

  const copy = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    haptics.success();
    Alert.alert('Copié', `${label} copié dans le presse-papier.`);
  };

  if (order) {
    const pending = order.status === 'pending';
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.successWrap}>
          <Animated.View entering={ZoomIn.springify().damping(10)} style={[styles.successCircle, { backgroundColor: pending ? theme.colors.accentLight : theme.colors.primarySoft }]}>
            <Ionicons name={pending ? 'hourglass-outline' : 'checkmark'} size={44} color={pending ? theme.colors.warning : theme.colors.primary} />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(160).springify()} style={[styles.successTitle, { color: theme.colors.text }]}>
            {pending ? 'Commande envoyée !' : 'C\'est à toi !'}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220).springify()} style={[styles.successDesc, { color: theme.colors.textSecondary }]}>
            {pending
              ? 'Tes cours s\'activent dès validation.'
              : 'Tes cours sont dans « Mes cours ».'}
          </Animated.Text>
          {pending && (
            <Animated.View entering={FadeInDown.delay(280).springify()} style={[styles.refCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <Text style={[styles.refLabel, { color: theme.colors.textMuted }]}>Ta référence</Text>
              <Pressable onPress={() => copy(order.reference, 'La référence')} style={styles.refRow}>
                <Text style={[styles.refValue, { color: theme.colors.text }]}>{order.reference}</Text>
                <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
              </Pressable>
              <Text style={[styles.refLabel, { color: theme.colors.textMuted }]}>{formatPrice(order.amount)} · {order.method}</Text>
            </Animated.View>
          )}
          <Animated.View entering={FadeInDown.delay(340).springify()} style={{ alignSelf: 'stretch', gap: 10, marginTop: 8 }}>
            {pending && <Button label="Renvoyer la capture sur WhatsApp" icon="logo-whatsapp" variant="outline" onPress={() => openWhatsapp(order)} />}
            <Button label="Voir mes cours" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'StudentTabs', params: { screen: 'MyCourses' } }] })} />
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer edges={['top']} scroll>
        <View style={styles.header}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Paiement</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.primarySoft }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12.5, fontWeight: '600' }} numberOfLines={1}>{title}</Text>
          <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatPrice(amount)}</Text>
          {bundle.savings > 0 && <Text style={{ color: theme.colors.primary, fontSize: 12.5, fontWeight: '700' }}>Tu économises {formatPrice(bundle.savings)}</Text>}
          {bundle.freeCourses.length > 0 && (
            <Text style={{ color: theme.colors.primary, fontSize: 12.5, fontWeight: '700', marginTop: 2 }}>+ {bundle.freeCourses.length} cours offert(s)</Text>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Payer avec</Text>
        {METHODS.map((m, i) => (
          <Animated.View key={m.id} entering={FadeInDown.delay(i * 60).springify()}>
            <Pressable
              onPress={() => {
                haptics.select();
                setMethod(m);
              }}
              style={({ pressed }) => [
                styles.methodRow,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border, transform: [{ scale: pressed ? 0.985 : 1 }], ...theme.shadow('sm') },
              ]}
            >
              <View style={styles.logoBox}>
                <Image source={m.logo} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.methodLabel, { color: theme.colors.text }]}>{m.label}</Text>
                <Text style={[styles.methodSublabel, { color: theme.colors.textMuted }]}>{m.sublabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))}
      </ScreenContainer>

      {!!method && (
        <View style={styles.modalRoot}>
          <Animated.View entering={FadeIn.duration(180)} style={StyleSheet.absoluteFill}>
            <Pressable style={styles.backdrop} onPress={() => !processing && setMethod(null)} />
          </Animated.View>
          <Animated.View entering={FadeInUp.springify().damping(16)} style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHero}>
                <View style={styles.sheetLogoBox}>
                  <Image source={method.logo} style={styles.logoImage} resizeMode="contain" />
                </View>
                <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Payer avec {method.label}</Text>
              </View>

              <View style={[styles.payBox, { backgroundColor: theme.colors.backgroundAlt }]}>
                <Text style={[styles.payLabel, { color: theme.colors.textMuted }]}>Montant</Text>
                <Pressable onPress={() => copy(String(amount), 'Le montant')} style={styles.payRow}>
                  <Text style={[styles.payValue, { color: theme.colors.text }]}>{formatPrice(amount)}</Text>
                  <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
                </Pressable>
                <Text style={[styles.payLabel, { color: theme.colors.textMuted, marginTop: 10 }]}>Numéro {method.label}</Text>
                <Pressable onPress={() => merchantNumber && copy(merchantNumber.replace(/\s/g, ''), 'Le numéro')} style={styles.payRow}>
                  <Text style={[styles.payValue, { color: theme.colors.text }]}>{merchantNumber || '—'}</Text>
                  <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
                </Pressable>
              </View>
            </ScrollView>
            <Button label="J'ai payé · envoyer sur WhatsApp" icon="logo-whatsapp" size="lg" loading={processing} onPress={confirm} />
            <Pressable onPress={() => setMethod(null)} disabled={processing} style={styles.cancelLink}>
              <Text style={[styles.cancelLinkText, { color: theme.colors.textMuted }]}>Annuler</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 18 },
  title: { fontSize: 20, fontWeight: '800', marginLeft: 4 },
  summaryCard: { padding: 18, borderRadius: 20, marginBottom: 22 },
  amount: { fontSize: 30, fontWeight: '900', marginTop: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  stepsCard: { borderRadius: 18, padding: 14, marginBottom: 22, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepNum: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepText: { flex: 1, fontSize: 13, lineHeight: 18 },
  methodRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  logoBox: { width: 54, height: 42, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  methodLabel: { fontSize: 14, fontWeight: '800' },
  methodSublabel: { fontSize: 11.5, marginTop: 2 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  successCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  successTitle: { fontSize: 24, fontWeight: '900', marginBottom: 10 },
  successDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 18 },
  refCard: { alignSelf: 'stretch', borderRadius: 18, padding: 16, alignItems: 'center', marginBottom: 12 },
  refLabel: { fontSize: 12, fontWeight: '600' },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  refValue: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  modalRoot: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 34, maxHeight: '88%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
  sheetHero: { alignItems: 'center', marginBottom: 16 },
  sheetLogoBox: { width: 70, height: 56, borderRadius: 14, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
  payBox: { borderRadius: 18, padding: 16, marginBottom: 14 },
  payLabel: { fontSize: 12, fontWeight: '700' },
  payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  payValue: { fontSize: 24, fontWeight: '900' },
  hintRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  hint: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  cancelLink: { alignSelf: 'center', marginTop: 12, padding: 4 },
  cancelLinkText: { fontSize: 13, fontWeight: '600' },
});
