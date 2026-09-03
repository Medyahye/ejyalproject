import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginBottom: 20, marginLeft: -8 }} />

      {!sent ? (
        <>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primarySoft }]}>
            <Ionicons name="key-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Mot de passe oublié ?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Entrez votre adresse e-mail, nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </Text>
          <Input label="Adresse e-mail" placeholder="vous@exemple.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <Button label="Envoyer le lien" onPress={handleSend} loading={loading} style={{ marginTop: 8 }} />
        </>
      ) : (
        <>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondarySoft }]}>
            <Ionicons name="checkmark-circle-outline" size={36} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>E-mail envoyé !</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Consultez votre boîte de réception ({email || 'votre e-mail'}) pour réinitialiser votre mot de passe.
          </Text>
          <Button label="Retour à la connexion" onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 50 },
  iconCircle: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 28 },
});
