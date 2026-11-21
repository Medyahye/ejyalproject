import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, KeyboardAvoidingView, Platform, TextInput, TextInputProps, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { haptics } from '../../utils/haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Big, friendly input: label inside the box, large text, clear focus and status. */
type InputRef = React.ComponentRef<typeof TextInput>;

const BigField = React.forwardRef<InputRef, TextInputProps & { label: string; icon: keyof typeof Ionicons.glyphMap; valid?: boolean; error?: string; right?: React.ReactNode }>(
  ({ label, icon, valid, error, right, onFocus, onBlur, ...rest }, ref) => {
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);
    const border = error ? theme.colors.danger : focused ? theme.colors.primary : 'transparent';
    return (
      <View style={{ marginBottom: 14 }}>
        <View style={[styles.field, { backgroundColor: focused ? theme.colors.surface : theme.colors.backgroundAlt, borderColor: border }]}>
          <Ionicons name={icon} size={22} color={focused ? theme.colors.primary : theme.colors.textMuted} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.fieldLabel, { color: focused ? theme.colors.primary : theme.colors.textMuted }]}>{label}</Text>
            <TextInput
              ref={ref}
              {...rest}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.primary}
              style={[styles.fieldInput, { color: theme.colors.text }]}
            />
          </View>
          {right}
          {valid && !right && (
            <Animated.View entering={ZoomIn.springify()}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            </Animated.View>
          )}
        </View>
        {!!error && <Text style={[styles.fieldError, { color: theme.colors.danger }]}>{error}</Text>}
      </View>
    );
  }
);

/** Student-only sign-in: big fields, one main button, sign-up right below. */
export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, loginAsDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [demoLoading, setDemoLoading] = useState(false);
  const passwordRef = useRef<InputRef>(null);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const emailOk = EMAIL_RE.test(email.trim());
  const ready = emailOk && password.length > 0;

  const shakeForm = () => {
    haptics.error();
    shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(-6, { duration: 50 }), withTiming(0, { duration: 50 }));
  };

  const handleLogin = async () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Écris ton adresse e-mail.';
    else if (!emailOk) next.email = 'Cette adresse e-mail ne semble pas correcte.';
    if (!password) next.password = 'Écris ton mot de passe.';
    setErrors(next);
    if (Object.keys(next).length) {
      shakeForm();
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      haptics.success();
    } catch (err) {
      shakeForm();
      const msg =
        err instanceof ApiError && err.status === 401
          ? 'E-mail ou mot de passe incorrect.'
          : err instanceof ApiError
            ? err.message
            : 'Pas de connexion internet. Réessaie.';
      setErrors({ password: msg });
    }
  };

  const tryDemo = async () => {
    haptics.tap();
    setDemoLoading(true);
    try {
      await loginAsDemo('student');
    } catch (err) {
      Alert.alert('Oups', err instanceof ApiError ? err.message : 'Pas de connexion internet. Réessaie.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.brandRow}>
          <LinearGradient colors={['#00C49A', '#00785C']} style={styles.logo}>
            <Ionicons name="school" size={22} color="#fff" />
          </LinearGradient>
          <Text style={[styles.brand, { color: theme.colors.text }]}>Générations du Futur</Text>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(60).springify()} style={[styles.title, { color: theme.colors.text }]}>
          Connexion
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Animated.View style={shakeStyle}>
            <BigField
              label="Adresse e-mail"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              valid={emailOk}
              error={errors.email}
            />
            <BigField
              ref={passwordRef}
              label="Mot de passe"
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              right={
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={12} style={styles.eye}>
                  <Text style={[styles.eyeText, { color: theme.colors.primary }]}>{showPassword ? 'Cacher' : 'Afficher'}</Text>
                </Pressable>
              }
            />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8} style={styles.forgot}>
            <Text style={[styles.forgotText, { color: theme.colors.textSecondary }]}>Mot de passe oublié ?</Text>
          </Pressable>

          <Pressable onPress={handleLogin} disabled={isLoading} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <LinearGradient
              colors={ready ? ['#00C49A', '#00785C'] : [theme.colors.border, theme.colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primary}
            >
              {isLoading && !demoLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.primaryText, { color: ready ? '#fff' : theme.colors.textMuted }]}>Se connecter</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.orText, { color: theme.colors.textMuted }]}>ou</Text>
            <View style={[styles.orLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={({ pressed }) => [styles.secondary, { borderColor: theme.colors.text, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          >
            <Text style={[styles.secondaryText, { color: theme.colors.text }]}>Créer mon compte</Text>
          </Pressable>

          <Pressable onPress={tryDemo} disabled={demoLoading} hitSlop={8} style={styles.demo}>
            {demoLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
                <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Visiter sans compte</Text>
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 40 },
  logo: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 16, fontWeight: '800' },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -0.6, marginBottom: 28 },
  subtitle: { fontSize: 16, marginTop: 6, marginBottom: 30, lineHeight: 22 },
  field: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 2, paddingHorizontal: 18, height: 74 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', marginBottom: 2 },
  fieldInput: { fontSize: 18, fontWeight: '600', paddingVertical: 2 },
  fieldError: { fontSize: 13.5, fontWeight: '600', marginTop: 6, marginLeft: 6 },
  eye: { paddingLeft: 10 },
  eyeText: { fontSize: 14, fontWeight: '800' },
  forgot: { alignSelf: 'flex-end', marginBottom: 22, marginTop: -2 },
  forgotText: { fontSize: 14, fontWeight: '700' },
  primary: { height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 18, fontWeight: '800' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  orLine: { flex: 1, height: 1 },
  orText: { marginHorizontal: 14, fontSize: 14, fontWeight: '600' },
  secondary: { height: 62, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 17, fontWeight: '800' },
  demo: { alignSelf: 'center', marginTop: 26, padding: 6 },
  demoText: { fontSize: 14.5 },
});
