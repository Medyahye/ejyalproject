import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { login, loginAsDemo, isLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await login(email || 'demo@educonnect.io', password || 'demo1234', role);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name="school" size={32} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Bon retour !</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Connectez-vous pour continuer votre apprentissage</Text>

        <View style={[styles.roleSwitch, { backgroundColor: theme.colors.backgroundAlt }]}>
          {(['student', 'teacher'] as UserRole[]).map((r) => (
            <Text
              key={r}
              onPress={() => setRole(r)}
              style={[
                styles.roleOption,
                {
                  backgroundColor: role === r ? theme.colors.primary : 'transparent',
                  color: role === r ? theme.colors.textInverse : theme.colors.textSecondary,
                },
              ]}
            >
              {r === 'student' ? 'Étudiant' : 'Professeur'}
            </Text>
          ))}
        </View>

        <Input label="Adresse e-mail" placeholder="vous@exemple.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <Input label="Mot de passe" placeholder="••••••••" icon="lock-closed-outline" isPassword value={password} onChangeText={setPassword} />

        <Text onPress={() => navigation.navigate('ForgotPassword')} style={[styles.forgot, { color: theme.colors.primary }]}>
          Mot de passe oublié ?
        </Text>

        <Button label="Se connecter" onPress={handleLogin} loading={isLoading} style={{ marginTop: 8 }} />

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>ou essayez la démo</Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>

        <Button
          label="Continuer comme étudiant"
          variant="outline"
          icon="person-outline"
          onPress={() => loginAsDemo('student')}
          style={{ marginBottom: 12 }}
        />
        <Button label="Continuer comme professeur" variant="outline" icon="easel-outline" onPress={() => loginAsDemo('teacher')} />

        <View style={styles.registerRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Pas encore de compte ? </Text>
          <Text onPress={() => navigation.navigate('Register')} style={{ color: theme.colors.primary, fontWeight: '800' }}>
            Créer un compte
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoCircle: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  roleSwitch: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 22 },
  roleOption: { flex: 1, textAlign: 'center', paddingVertical: 10, borderRadius: 11, fontWeight: '700', fontSize: 13, overflow: 'hidden' },
  forgot: { textAlign: 'right', fontSize: 13, fontWeight: '700', marginBottom: 20, marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
});
