import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { Button, IconButton, Input, PinInput } from '../../components/ui';
import { formatPrice } from '../../utils/formatters';
import { StudentStackParamList } from '../../navigation/types';
import { Payment } from '../../types';
import { ApiError } from '../../api/client';
import { haptics } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Method = Payment['method'];

interface MethodInfo {
  id: Method;
  label: string;
  sublabel: string;
  logo: number;
  tone: 'primary' | 'secondary' | 'accent' | 'info';
}

const METHODS: MethodInfo[] = [
  { id: 'Bankily', label: 'Bankily', sublabel: 'Banque Populaire de Mauritanie', logo: require('../../../assets/payments/bankily.jpg'), tone: 'primary' },
  { id: 'Masrvi', label: 'Masrvi', sublabel: 'BMCI Mobile', logo: require('../../../assets/payments/masrvi.png'), tone: 'secondary' },
  { id: 'Sedad', label: 'Sedad', sublabel: 'BMI Mobile', logo: require('../../../assets/payments/sedad.png'), tone: 'accent' },
  { id: 'Click', label: 'Click', sublabel: 'Banque Nationale de Mauritanie', logo: require('../../../assets/payments/click.jpg'), tone: 'info' },
];

export const PaymentScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { cartItems, cartTotal, purchaseCart } = useStudentData();
  const [activeMethod, setActiveMethod] = useState<MethodInfo | null>(null);
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  const toneColors: Record<MethodInfo['tone'], { main: string; soft: string }> = {
    primary: { main: theme.colors.primary, soft: theme.colors.primarySoft },
    secondary: { main: theme.colors.secondary, soft: theme.colors.secondarySoft },
    accent: { main: theme.colors.accent, soft: theme.colors.accentLight },
    info: { main: theme.colors.info, soft: theme.colors.infoLight },
  };

  const closeModal = () => {
    if (processing) return;
    setActiveMethod(null);
    setPhone('');
    setPasscode('');
  };

  const handlePay = async () => {
    if (!activeMethod) return;
    if (!phone.trim()) {
      Alert.alert('Numéro requis', `Merci de renseigner le numéro associé à votre compte ${activeMethod.label}.`);
      return;
    }
    if (!passcode.trim()) {
      Alert.alert('Code secret requis', `Merci de renseigner votre code secret ${activeMethod.label}.`);
      return;
    }
    setProcessing(true);
    try {
      const amount = cartTotal;
      await purchaseCart(activeMethod.id);
      setPaidAmount(amount);
      setActiveMethod(null);
      setPhone('');
      setPasscode('');
      setSuccess(true);
      haptics.success();
    } catch (err) {
      Alert.alert('Paiement échoué', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.successWrap}>
          <View style={styles.successCircleOuter}>
            <Animated.View
              entering={ZoomIn.delay(400).duration(250)}
              style={[styles.sparkle, { top: 4, left: 6 }]}
            >
              <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
            </Animated.View>
            <Animated.View
              entering={ZoomIn.delay(520).duration(250)}
              style={[styles.sparkle, { bottom: 8, right: 0 }]}
            >
              <Ionicons name="sparkles" size={11} color={theme.colors.secondary} />
            </Animated.View>
            <Animated.View
              entering={ZoomIn.delay(60).springify().damping(9)}
              style={[styles.successCircle, { backgroundColor: theme.colors.secondarySoft }]}
            >
              <Ionicons name="checkmark" size={44} color={theme.colors.secondary} />
            </Animated.View>
          </View>
          <Animated.Text entering={FadeInDown.delay(260).springify()} style={[styles.successTitle, { color: theme.colors.text }]}>
            Paiement réussi !
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(320).springify()} style={[styles.successDesc, { color: theme.colors.textSecondary }]}>
            Votre achat de {formatPrice(paidAmount)} a été confirmé. Vos cours sont maintenant disponibles.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(380).springify()}>
            <Button
              label="Voir mes cours"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'StudentTabs', params: { screen: 'MyCourses' } }] })}
              style={{ marginTop: 12 }}
            />
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
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12.5 }}>Montant total ({cartItems.length} cours)</Text>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatPrice(cartTotal)}</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Choisissez votre mode de paiement</Text>
      {METHODS.map((m, i) => (
        <Animated.View key={m.id} entering={FadeInDown.delay(i * 70).springify()}>
          <Pressable
            onPress={() => setActiveMethod(m)}
            style={({ pressed }) => [
              styles.methodRow,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
                ...theme.shadow('sm'),
              },
            ]}
          >
            <View style={styles.logoBox}>
              <Image source={m.logo} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.methodLabel, { color: theme.colors.text }]}>{m.label}</Text>
              <Text style={[styles.methodSublabel, { color: theme.colors.textMuted }]}>{m.sublabel}</Text>
            </View>
            <View style={[styles.chevronCircle, { backgroundColor: theme.colors.backgroundAlt }]}>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </Pressable>
        </Animated.View>
      ))}

      <View style={[styles.secureRow]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.secondary} />
        <Text style={[styles.secureText, { color: theme.colors.textMuted }]}>Paiement 100% sécurisé (simulation)</Text>
      </View>
    </ScreenContainer>

    {!!activeMethod && (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Animated.View entering={FadeIn.duration(180)} style={StyleSheet.absoluteFill}>
          <Pressable style={styles.backdrop} onPress={closeModal} />
        </Animated.View>
        <Animated.View entering={FadeInUp.springify().damping(16)} style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />
          <IconButton icon="close" onPress={closeModal} variant="ghost" size={32} style={styles.sheetClose} />

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.sheetScroll}>
            <View style={styles.sheetHero}>
              <View style={[styles.sheetLogoBox, { backgroundColor: toneColors[activeMethod.tone].soft }]}>
                <Image source={activeMethod.logo} style={styles.logoImageLarge} resizeMode="contain" />
              </View>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Payer avec {activeMethod.label}</Text>
              <Text style={[styles.methodSublabel, { color: theme.colors.textMuted }]}>{activeMethod.sublabel}</Text>
            </View>

            <View style={[styles.amountCard, { backgroundColor: theme.colors.backgroundAlt }]}>
              <Text style={[styles.amountLabel, { color: theme.colors.textMuted }]}>Montant à payer</Text>
              <Text style={[styles.amountValue, { color: theme.colors.text }]}>{formatPrice(cartTotal)}</Text>
            </View>

            <Input
              label={`Numéro ${activeMethod.label}`}
              placeholder="2X XX XX XX"
              icon="call-outline"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={[styles.pinLabel, { color: theme.colors.textSecondary }]}>Code secret</Text>
            <PinInput length={4} value={passcode} onChangeText={setPasscode} />

            <View style={styles.hintRow}>
              <Ionicons name="shield-checkmark" size={13} color={theme.colors.secondary} />
              <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
                Vous recevrez une demande de confirmation {activeMethod.label} pour valider le paiement.
              </Text>
            </View>
          </ScrollView>

          <Button label={`Confirmer • ${formatPrice(cartTotal)}`} onPress={handlePay} loading={processing} style={{ marginTop: 4 }} />
          <Pressable onPress={closeModal} disabled={processing} style={styles.cancelLink}>
            <Text style={[styles.cancelLinkText, { color: theme.colors.textMuted }]}>Annuler</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '700', marginLeft: 4 },
  summaryCard: { padding: 18, borderRadius: 18, marginBottom: 24 },
  amount: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  methodRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1.5, marginBottom: 10 },
  logoBox: {
    width: 52,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  chevronCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontSize: 13.5, fontWeight: '700' },
  methodSublabel: { fontSize: 11, marginTop: 2 },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 4 },
  secureText: { fontSize: 11.5, marginLeft: 6 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircleOuter: { marginBottom: 24 },
  sparkle: { position: 'absolute', zIndex: 1 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  successDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  modalRoot: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: '90%' },
  sheetScroll: { maxHeight: 420 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  sheetClose: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  sheetHero: { alignItems: 'center', marginTop: 12, marginBottom: 20 },
  sheetLogoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  logoImageLarge: { width: '62%', height: '62%' },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  amountCard: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  amountLabel: { fontSize: 11.5, fontWeight: '600' },
  amountValue: { fontSize: 30, fontWeight: '700', marginTop: 4 },
  pinLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, marginBottom: 18, gap: 6 },
  hint: { flex: 1, fontSize: 11.5, lineHeight: 16 },
  cancelLink: { alignSelf: 'center', marginTop: 14, padding: 4 },
  cancelLinkText: { fontSize: 13, fontWeight: '600' },
});
