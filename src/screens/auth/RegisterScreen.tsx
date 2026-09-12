import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { UserRole } from '../../types';
import { ApiError } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const ROLE_OPTIONS: Array<{ role: UserRole; icon: keyof typeof Ionicons.glyphMap; title: string; description: string; gradient: readonly [string, string] }> = [
  {
    role: 'student',
    icon: 'book-outline',
    title: 'Étudiant',
    description: 'Accédez à des cours, suivez votre progression et préparez vos examens.',
    gradient: ['#5B9CFF', '#3D7FF7'],
  },
  {
    role: 'teacher',
    icon: 'easel-outline',
    title: 'Professeur',
    description: 'Publiez vos cours, gérez vos étudiants et suivez vos revenus.',
    gradient: ['#00B894', '#009975'],
  },
];

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) score++;
  const clamped = Math.min(score, 3) as 0 | 1 | 2 | 3;
  const labels = ['', 'Faible', 'Moyen', 'Fort'];
  return { score: clamped, label: labels[clamped] };
}

const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const { theme } = useTheme();
  const { score, label } = passwordStrength(password);
  const width = useSharedValue(0);
  const target = score === 0 ? 0 : score === 1 ? 0.33 : score === 2 ? 0.66 : 1;
  width.value = withTiming(target, { duration: 350 });

  const barStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  const color = score <= 1 ? theme.colors.danger : score === 2 ? theme.colors.warning : theme.colors.success;

  if (!password) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: -8, marginBottom: 12 }}>
      <View style={[styles.strengthTrack, { backgroundColor: theme.colors.border }]}>
        <Animated.View style={[styles.strengthFill, barStyle, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
    </Animated.View>
  );
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState<0 | 1>(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

  const goToForm = () => {
    if (!role) return;
    setStep(1);
  };

  const handleRegister = async () => {
    const nextErrors: typeof errors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Merci de renseigner votre nom complet.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Adresse e-mail invalide.';
    if (password.length < 6) nextErrors.password = 'Au moins 6 caractères.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !role) return;

    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, role });
    } catch (err) {
      Alert.alert('Inscription impossible', err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    }
  };

  const selectedRoleInfo = ROLE_OPTIONS.find((r) => r.role === role);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <IconButton
            icon="arrow-back"
            onPress={() => (step === 1 ? setStep(0) : navigation.goBack())}
            variant="ghost"
            style={{ marginLeft: -8 }}
          />
          <View style={styles.stepDots}>
            <View style={[styles.stepDot, { backgroundColor: theme.colors.primary, width: step === 0 ? 22 : 8 }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 1 ? theme.colors.primary : theme.colors.border, width: step === 1 ? 22 : 8 }]} />
          </View>
        </View>

        {step === 0 ? (
          <Animated.View key="step-role" entering={FadeIn.duration(220)}>
            <Animated.Text entering={FadeInDown.delay(60).springify()} style={[styles.title, { color: theme.colors.text }]}>
              Créer un compte
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(120).springify()} style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Choisissez comment vous voulez utiliser EduConnect
            </Animated.Text>

            {ROLE_OPTIONS.map((opt, i) => {
              const selected = role === opt.role;
              return (
                <Animated.View key={opt.role} entering={FadeInDown.delay(180 + i * 80).springify()}>
                  <Pressable
                    onPress={() => setRole(opt.role)}
                    style={({ pressed }) => [
                      styles.roleCard,
                      {
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: theme.colors.card,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        ...(selected ? theme.shadow('md') : theme.shadow('sm')),
                      },
                    ]}
                  >
                    <LinearGradient colors={opt.gradient} style={styles.roleIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name={opt.icon} size={24} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={[styles.roleTitle, { color: theme.colors.text }]}>{opt.title}</Text>
                      <Text style={[styles.roleDescription, { color: theme.colors.textMuted }]}>{opt.description}</Text>
                    </View>
                    {selected && (
                      <Animated.View entering={ZoomIn.duration(200).springify()} style={[styles.checkBadge, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </Animated.View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}

            <Animated.View entering={FadeInDown.delay(340).springify()}>
              <Button label="Continuer" onPress={goToForm} disabled={!role} style={{ marginTop: 8 }} icon="arrow-forward" iconPosition="right" />
            </Animated.View>
          </Animated.View>
        ) : (
          <Animated.View key="step-form" entering={FadeInDown.duration(280).springify()}>
            {selectedRoleInfo && (
              <View style={[styles.rolePill, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name={selectedRoleInfo.icon} size={15} color={theme.colors.primary} />
                <Text style={[styles.rolePillLabel, { color: theme.colors.primary }]}>Inscription — {selectedRoleInfo.title}</Text>
                <Text onPress={() => setStep(0)} style={[styles.rolePillChange, { color: theme.colors.primary }]}>
                  Changer
                </Text>
              </View>
            )}

            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <Input
                label="Nom complet"
                placeholder="Jean Dupont"
                icon="person-outline"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (errors.fullName) setErrors((e) => ({ ...e, fullName: undefined }));
                }}
                error={errors.fullName}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(120).springify()}>
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
            <Animated.View entering={FadeInDown.delay(180).springify()}>
              <Input
                label="Mot de passe"
                placeholder="8 caractères minimum"
                icon="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                error={errors.password}
              />
              <StrengthBar password={password} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).springify()}>
              <Button label="Créer mon compte" onPress={handleRegister} loading={isLoading} style={{ marginTop: 8 }} />
            </Animated.View>
          </Animated.View>
        )}

        <View style={styles.loginRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Déjà inscrit ? </Text>
          <Text onPress={() => navigation.navigate('Login')} style={{ color: theme.colors.primary, fontWeight: '700' }}>
            Se connecter
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stepDots: { flexDirection: 'row', gap: 6 },
  stepDot: { height: 8, borderRadius: 4 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  roleCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1.5, marginBottom: 14 },
  roleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleTitle: { fontSize: 15.5, fontWeight: '700', marginBottom: 3 },
  roleDescription: { fontSize: 12, lineHeight: 17 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  rolePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 20 },
  rolePillLabel: { fontSize: 12.5, fontWeight: '700', marginLeft: 6 },
  rolePillChange: { fontSize: 11.5, fontWeight: '700', marginLeft: 10, textDecorationLine: 'underline' },
  strengthTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  strengthFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
