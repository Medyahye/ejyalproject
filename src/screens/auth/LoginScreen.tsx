import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';
import { ApiError } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { login, loginAsDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Merci de renseigner votre e-mail.";
    if (!password.trim()) nextErrors.password = 'Merci de renseigner votre mot de passe.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Connexion impossible', err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  };

  const handleDemoLogin = async (demoRole: UserRole) => {
    try {
      await loginAsDemo(demoRole);
    } catch (err) {
      Alert.alert('Connexion impossible', err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View entering={ZoomIn.delay(60).springify()} style={[styles.logoCircle, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name="school" size={32} color={theme.colors.primary} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(120).springify()} style={[styles.title, { color: theme.colors.text }]}>
          Bon retour !
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(160).springify()} style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Connectez-vous pour continuer votre apprentissage
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Input
            label="Adresse e-mail"
            placeholder="vous@exemple.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            error={errors.email}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(270).springify()}>
          <Input
            label="Mot de passe"
            placeholder="••••••••"
            icon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(300).springify()}
          onPress={() => navigation.navigate('ForgotPassword')}
          style={[styles.forgot, { color: theme.colors.primary }]}
        >
          Mot de passe oublié ?
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <Button label="Se connecter" onPress={handleLogin} loading={isLoading} style={{ marginTop: 8 }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>ou essayez la démo</Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(440).springify()}>
          <Button
            label="Continuer comme étudiant"
            variant="outline"
            icon="person-outline"
            onPress={() => handleDemoLogin('student')}
            style={{ marginBottom: 12 }}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(480).springify()}>
          <Button label="Continuer comme professeur" variant="outline" icon="easel-outline" onPress={() => handleDemoLogin('teacher')} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(520).springify()} style={styles.registerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Pas encore de compte ? </Text>
          <Text onPress={() => navigation.navigate('Register')} style={{ color: theme.colors.primary, fontWeight: '700' }}>
            Créer un compte
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoCircle: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  forgot: { textAlign: 'right', fontSize: 13, fontWeight: '700', marginBottom: 20, marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
});
