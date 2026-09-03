import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { Button, IconButton, Input } from '../../components/ui';
import { formatPrice } from '../../utils/formatters';
import { StudentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;
type Method = 'card' | 'paypal' | 'mobile';

export const PaymentScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { cartItems, cartTotal, purchaseCart } = useStudentData();
  const [method, setMethod] = useState<Method>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1600));
    purchaseCart();
    setProcessing(false);
    setSuccess(true);
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
            Votre achat de {formatPrice(cartTotal)} a été confirmé (simulation). Vos cours sont maintenant disponibles.
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

  const methods: Array<{ id: Method; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'card', label: 'Carte bancaire', icon: 'card-outline' },
    { id: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
    { id: 'mobile', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  ];

  return (
    <ScreenContainer edges={['top']} scroll>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Paiement</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.colors.primarySoft }]}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12.5 }}>Montant total ({cartItems.length} cours)</Text>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>{formatPrice(cartTotal)}</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Méthode de paiement</Text>
      {methods.map((m) => (
        <Pressable
          key={m.id}
          onPress={() => setMethod(m.id)}
          style={[
            styles.methodRow,
            {
              backgroundColor: theme.colors.card,
              borderColor: method === m.id ? theme.colors.primary : theme.colors.border,
              ...theme.shadow('sm'),
            },
          ]}
        >
          <Ionicons name={m.icon} size={22} color={method === m.id ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.methodLabel, { color: theme.colors.text }]}>{m.label}</Text>
          <Ionicons
            name={method === m.id ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={method === m.id ? theme.colors.primary : theme.colors.textMuted}
          />
        </Pressable>
      ))}

      {method === 'card' && (
        <View style={{ marginTop: 8 }}>
          <Input label="Numéro de carte" placeholder="4242 4242 4242 4242" icon="card-outline" keyboardType="number-pad" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input label="Expiration" placeholder="MM/AA" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="CVV" placeholder="123" keyboardType="number-pad" isPassword />
            </View>
          </View>
        </View>
      )}

      <View style={[styles.secureRow]}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.secondary} />
        <Text style={[styles.secureText, { color: theme.colors.textMuted }]}>Paiement 100% sécurisé (simulation)</Text>
      </View>

      <Button label={`Payer ${formatPrice(cartTotal)}`} onPress={handlePay} loading={processing} style={{ marginTop: 12 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', marginLeft: 4 },
  summaryCard: { padding: 18, borderRadius: 18, marginBottom: 24 },
  amount: { fontSize: 28, fontWeight: '800', marginTop: 6 },
  sectionLabel: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  methodRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 10 },
  methodLabel: { flex: 1, marginLeft: 12, fontSize: 13.5, fontWeight: '700' },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 4 },
  secureText: { fontSize: 11.5, marginLeft: 6 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  successDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
