import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { UserRole } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { register, isLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    await register({ fullName: fullName || 'Nouvel utilisateur', email: email || 'nouveau@educonnect.io', role });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginBottom: 12, marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Créer un compte</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Rejoignez la communauté EduConnect</Text>

        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Je m'inscris en tant que</Text>
        <View style={styles.roleCards}>
          {(
            [
              { role: 'student' as UserRole, label: 'Étudiant', icon: 'book-outline' as const },
              { role: 'teacher' as UserRole, label: 'Professeur', icon: 'easel-outline' as const },
            ]
          ).map((opt) => {
            const selected = role === opt.role;
            return (
              <View
                key={opt.role}
                onTouchEnd={() => setRole(opt.role)}
                style={[
                  styles.roleCard,
                  {
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? theme.colors.primarySoft : theme.colors.card,
                  },
                ]}
              >
                <Ionicons name={opt.icon} size={26} color={selected ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.roleLabel, { color: selected ? theme.colors.primary : theme.colors.text }]}>{opt.label}</Text>
              </View>
            );
          })}
        </View>

        <Input label="Nom complet" placeholder="Jean Dupont" icon="person-outline" value={fullName} onChangeText={setFullName} />
        <Input label="Adresse e-mail" placeholder="vous@exemple.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <Input label="Mot de passe" placeholder="8 caractères minimum" icon="lock-closed-outline" isPassword value={password} onChangeText={setPassword} />

        <Button label="Créer mon compte" onPress={handleRegister} loading={isLoading} style={{ marginTop: 12 }} />

        <View style={styles.loginRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Déjà inscrit ? </Text>
          <Text onPress={() => navigation.navigate('Login')} style={{ color: theme.colors.primary, fontWeight: '800' }}>
            Se connecter
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  roleCards: { flexDirection: 'row', marginBottom: 22 },
  roleCard: { flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: 16, borderWidth: 1.5, marginRight: 12 },
  roleLabel: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
