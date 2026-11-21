import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutLeft, ZoomIn, LinearTransition } from 'react-native-reanimated';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { GradeTrack, Track } from '../../types';
import { fetchTracks } from '../../api/catalog';
import { ApiError } from '../../api/client';
import { ClassPicker } from '../../components/student/ClassPicker';
import { haptics } from '../../utils/haptics';


type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type Step = 'name' | 'email' | 'password' | 'class';
const STEPS: Step[] = ['name', 'email', 'password', 'class'];

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Password rules mirror Django's validators (length, not only digits). */
function passwordChecks(pw: string) {
  return [
    { ok: pw.length >= 8, label: 'Au moins 8 caractères' },
    { ok: /[A-Za-zÀ-ÿ]/.test(pw), label: 'Au moins une lettre' },
    { ok: /\d/.test(pw), label: 'Au moins un chiffre' },
  ];
}

/** Student sign-up, one question per screen. Teacher accounts are created by the director. */
export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gradeTrack, setGradeTrack] = useState<GradeTrack | ''>('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const step = STEPS[stepIndex];
  const firstName = fullName.trim().split(/\s+/)[0] ?? '';
  const checks = passwordChecks(password);

  useEffect(() => {
    fetchTracks().then(setTracks).catch(() => {});
  }, []);

  useEffect(() => {
    setError(null);
    if (step !== 'class') {
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [step]);

  const validate = (): string | null => {
    if (step === 'name' && fullName.trim().split(/\s+/).length < 2) return 'Écris ton prénom et ton nom.';
    if (step === 'email' && !EMAIL_RE.test(email.trim())) return 'Cet e-mail ne semble pas valide.';
    if (step === 'password' && !checks.every((c) => c.ok)) return 'Ton mot de passe doit respecter les 3 règles.';
    if (step === 'class' && !gradeTrack) return 'Choisis ta classe.';
    return null;
  };

  const submit = async () => {
    try {
      await register({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password, role: 'student', gradeTrack: gradeTrack || undefined });
      haptics.success();
    } catch (err) {
      haptics.error();
      const message = err instanceof ApiError ? err.message : 'Vérifie ta connexion internet et réessaie.';
      // Send the student back to the field that has the problem.
      if (/mail/i.test(message)) setStepIndex(1);
      else if (/mot de passe|password/i.test(message)) setStepIndex(2);
      Alert.alert('Inscription impossible', message);
    }
  };

  const next = () => {
    const problem = validate();
    if (problem) {
      haptics.warning();
      setError(problem);
      return;
    }
    haptics.tap();
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    else submit();
  };

  const back = () => {
    haptics.tap();
    if (stepIndex === 0) navigation.goBack();
    else setStepIndex(stepIndex - 1);
  };

  const QUESTIONS: Record<Step, { emoji: string; title: string; subtitle: string }> = {
    name: { emoji: 'Étape 1', title: 'Ton nom', subtitle: 'Ton prénom et ton nom, comme sur ta carte d\'élève.' },
    email: { emoji: 'Étape 2', title: 'Ton e-mail', subtitle: 'Tu t\'en serviras pour te connecter.' },
    password: { emoji: 'Étape 3', title: 'Mot de passe', subtitle: 'Garde-le pour toi, il protège tes cours.' },
    class: { emoji: 'Dernière étape', title: 'Ta classe', subtitle: 'On te montrera directement les cours de ton programme.' },
  };
  const q = QUESTIONS[step];

  const renderField = () => {
    if (step === 'class') {
      return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          <ClassPicker tracks={tracks} value={gradeTrack} onChange={(t) => { setGradeTrack(t); setError(null); }} />
        </ScrollView>
      );
    }
    const common = {
      ref: inputRef,
      returnKeyType: 'next' as const,
      onSubmitEditing: next,
      blurOnSubmit: false,
      placeholderTextColor: theme.colors.textMuted,
      style: [styles.bigInput, { color: theme.colors.text }],
      selectionColor: theme.colors.primary,
    };
    return (
      <View>
        <View style={[styles.inputLine, { borderBottomColor: error ? theme.colors.danger : theme.colors.primary }]}>
          {step === 'name' && (
            <TextInput {...common} value={fullName} onChangeText={(v) => { setFullName(v); setError(null); }} placeholder="Mariem Mint Ahmed" autoCapitalize="words" autoComplete="name" textContentType="name" />
          )}
          {step === 'email' && (
            <TextInput {...common} value={email} onChangeText={(v) => { setEmail(v); setError(null); }} placeholder="toi@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          )}
          {step === 'password' && (
            <>
              <TextInput
                {...common}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={12}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.colors.textMuted} />
              </Pressable>
            </>
          )}
          {((step === 'name' && fullName.trim().split(/\s+/).length >= 2) || (step === 'email' && EMAIL_RE.test(email.trim()))) && (
            <Animated.View entering={ZoomIn.springify()}>
              <Ionicons name="checkmark-circle" size={26} color={theme.colors.primary} />
            </Animated.View>
          )}
        </View>
        {step === 'password' && (
          <View style={styles.checks}>
            {checks.map((c) => (
              <View key={c.label} style={styles.checkRow}>
                <Ionicons name={c.ok ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={c.ok ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.checkText, { color: c.ok ? theme.colors.text : theme.colors.textMuted }]}>{c.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={back} hitSlop={12} style={[styles.backBtn, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Ionicons name={stepIndex === 0 ? 'close' : 'arrow-back'} size={20} color={theme.colors.text} />
        </Pressable>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
          <Animated.View layout={LinearTransition.springify().damping(18)} style={[styles.progressFill, { width: `${((stepIndex + 1) / STEPS.length) * 100}%` }]}>
            <LinearGradient colors={['#00C49A', '#00785C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
        <Text style={[styles.stepCount, { color: theme.colors.textMuted }]}>{stepIndex + 1}/{STEPS.length}</Text>
      </View>

      <Animated.View key={step} entering={FadeInRight.springify().damping(18)} exiting={FadeOutLeft.duration(150)} style={styles.body}>
        <Animated.View entering={ZoomIn.delay(80).springify()} style={styles.stepMark}>
          <Text style={[styles.stepLabel, { color: theme.colors.primary }]}>{q.emoji.toUpperCase()}</Text>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(100).springify()} style={[styles.title, { color: theme.colors.text }]}>{q.title}</Animated.Text>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ flex: step === 'class' ? 1 : 0 }}>
          {renderField()}
        </Animated.View>
        {!!error && (
          <Animated.View entering={FadeIn} style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          </Animated.View>
        )}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          label={step === 'class' ? 'Créer mon compte' : 'Continuer'}
          icon={step === 'class' ? 'sparkles' : 'arrow-forward'}
          iconPosition={step === 'class' ? 'left' : 'right'}
          size="lg"
          loading={isLoading}
          onPress={next}
        />
        {stepIndex === 0 && (
          <Text style={[styles.loginLink, { color: theme.colors.textSecondary }]}>
            Déjà un compte ?{' '}
            <Text onPress={() => navigation.goBack()} style={{ color: theme.colors.primary, fontWeight: '800' }}>
              Se connecter
            </Text>
          </Text>
        )}
        {step === 'class' && (
          <View />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, overflow: 'hidden' },
  stepCount: { fontSize: 13, fontWeight: '800', minWidth: 28, textAlign: 'right' },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 34 },
  stepMark: { alignSelf: 'flex-start', marginBottom: 10 },
  stepLabel: { fontSize: 12.5, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 29, fontWeight: '900', lineHeight: 35, marginBottom: 30 },
  subtitle: { fontSize: 15, lineHeight: 21, marginTop: 8, marginBottom: 30 },
  inputLine: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2.5, paddingBottom: 8, gap: 10 },
  bigInput: { flex: 1, fontSize: 24, fontWeight: '700', paddingVertical: 6 },
  checks: { marginTop: 18, gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText: { fontSize: 14, fontWeight: '600' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  errorText: { fontSize: 13.5, fontWeight: '700' },
  footer: { paddingHorizontal: 24, paddingTop: 10 },
  loginLink: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  legal: { textAlign: 'center', marginTop: 12, fontSize: 12 },
});
