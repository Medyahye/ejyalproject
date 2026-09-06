import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { Button, IconButton, Input } from '../../components/ui';
import { formatPrice } from '../../utils/formatters';
import { StudentStackParamList } from '../../navigation/types';
import { Payment } from '../../types';
import { ApiError } from '../../api/client';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Method = Payment['method'];

interface MethodInfo {
  id: Method;
  label: string;
  sublabel: string;
  logo: number;
}

const METHODS: MethodInfo[] = [
  { id: 'Bankily', label: 'Bankily', sublabel: 'Banque Populaire de Mauritanie', logo: require('../../../assets/payments/bankily.jpg') },
  { id: 'Masrvi', label: 'Masrvi', sublabel: 'BMCI Mobile', logo: require('../../../assets/payments/masrvi.png') },
  { id: 'Sedad', label: 'Sedad', sublabel: 'BMI Mobile', logo: require('../../../assets/payments/sedad.png') },
  { id: 'Click', label: 'Click', sublabel: 'Banque Nationale de Mauritanie', logo: require('../../../assets/payments/click.jpg') },
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
          <View style={[styles.successCircle, { backgroundColor: theme.colors.secondarySoft }]}>
            <Ionicons name="checkmark" size={44} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>Paiement réussi !</Text>
          <Text style={[styles.successDesc, { color: theme.colors.textSecondary }]}>
            Votre achat de {formatPrice(paidAmount)} a été confirmé. Vos cours sont maintenant disponibles.
          </Text>
          <Button
            label="Voir mes cours"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'StudentTabs', params: { screen: 'MyCourses' } }] })}
            style={{ marginTop: 12 }}
          />
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
      {METHODS.map((m) => (
        <Pressable
          key={m.id}
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
      ))}

      <View style={[styles.secureRow]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.secondary} />
        <Text style={[styles.secureText, { color: theme.colors.textMuted }]}>Paiement 100% sécurisé (simulation)</Text>
      </View>
    </ScreenContainer>

    {!!activeMethod && (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={closeModal} />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.sheetHandle, { backgroundColor: theme.colors.border }]} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetLogoBox}>
              <Image source={activeMethod.logo} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Payer avec {activeMethod.label}</Text>
              <Text style={[styles.methodSublabel, { color: theme.colors.textMuted }]}>{activeMethod.sublabel}</Text>
            </View>
            <IconButton icon="close" onPress={closeModal} variant="ghost" size={34} />
          </View>

          <Input label="Montant (UM)" icon="cash-outline" value={formatPrice(cartTotal)} editable={false} />

          <Input
            label={`Numéro ${activeMethod.label}`}
            placeholder="2X XX XX XX"
            icon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Input
            label="Code secret"
            placeholder="••••"
            icon="lock-closed-outline"
            keyboardType="number-pad"
            isPassword
            value={passcode}
            onChangeText={setPasscode}
          />

          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            Vous recevrez une demande de confirmation {activeMethod.label} sur ce numéro pour valider le paiement.
          </Text>

          <Button label={`Confirmer • ${formatPrice(cartTotal)}`} onPress={handlePay} loading={processing} style={{ marginTop: 8 }} />
          <Button label="Annuler" variant="ghost" onPress={closeModal} disabled={processing} style={{ marginTop: 4 }} />
        </View>
      </KeyboardAvoidingView>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', marginLeft: 4 },
  summaryCard: { padding: 18, borderRadius: 18, marginBottom: 24 },
  amount: { fontSize: 28, fontWeight: '800', marginTop: 6 },
  sectionLabel: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
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
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  successDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  modalRoot: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sheetLogoBox: {
    width: 56,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  sheetTitle: { fontSize: 16, fontWeight: '800' },
  hint: { fontSize: 11.5, lineHeight: 16, marginTop: -6, marginBottom: 18 },
});
