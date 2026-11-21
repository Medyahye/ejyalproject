import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { Avatar, Button, Chip } from '../../components/ui';
import { createAccount, createTrack, deleteTrack, updateSettings, updateTerm } from '../../api/staff';
import { ApiError } from '../../api/client';
import { LEVELS, tracksForLevel } from '../../constants/levels';
import { SchoolLevel, UserRole } from '../../types';
import { haptics } from '../../utils/haptics';

const ROLES: Array<{ id: UserRole; label: string }> = [
  { id: 'student', label: 'Élève' },
  { id: 'teacher', label: 'Professeur' },
  { id: 'admin', label: 'Admin' },
  { id: 'director', label: 'Directeur' },
];

const Field: React.FC<{ value: string; onChangeText: (v: string) => void; placeholder: string; icon: keyof typeof Ionicons.glyphMap; secure?: boolean; keyboard?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' }> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  secure,
  keyboard = 'default',
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.field, { backgroundColor: theme.colors.backgroundAlt, borderColor: theme.colors.border }]}>
      <Ionicons name={icon} size={16} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={keyboard === 'email-address' || secure ? 'none' : 'sentences'}
        style={[styles.fieldInput, { color: theme.colors.text }]}
      />
    </View>
  );
};

const Section: React.FC<{ icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; delay: number; children: React.ReactNode }> = ({ icon, title, subtitle, delay, children }) => {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={[styles.section, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </Animated.View>
  );
};

export const DirectorScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { tracks, terms, settings, refresh } = useCatalog();
  const isDirector = user?.role === 'director';

  // Create account
  const [role, setRole] = useState<UserRole>('teacher');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [share, setShare] = useState('50');
  const [creating, setCreating] = useState(false);

  // New class
  const [level, setLevel] = useState<SchoolLevel>('college');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');

  // Terms & settings drafts
  const [termDrafts, setTermDrafts] = useState<Record<number, { startDate: string; endDate: string }>>({});
  const [whatsapp, setWhatsapp] = useState('');
  const [merchants, setMerchants] = useState<Record<string, string>>({});
  const [maxViews, setMaxViews] = useState('4');
  const [teacherViews, setTeacherViews] = useState('2');

  useEffect(() => {
    setTermDrafts(Object.fromEntries(terms.map((t) => [t.number, { startDate: t.startDate, endDate: t.endDate }])));
  }, [terms]);
  useEffect(() => {
    if (!settings) return;
    setWhatsapp(settings.whatsappNumber);
    setMerchants(settings.merchantNumbers ?? {});
    setMaxViews(String(settings.defaultMaxViews));
    setTeacherViews(String(settings.teacherOfferMaxViews));
  }, [settings]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      await refresh().catch(() => {});
      haptics.success();
      Alert.alert('C\'est fait', success);
      return true;
    } catch (err) {
      Alert.alert('Erreur', err instanceof ApiError ? err.message : 'Action impossible.');
      return false;
    }
  };

  const submitAccount = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      Alert.alert('Champs requis', 'Nom, email et mot de passe (8 caractères minimum).');
      return;
    }
    setCreating(true);
    const ok = await run(
      () =>
        createAccount({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          ...(role === 'teacher' ? { revenueShare: Number(share) || 50 } : {}),
        }),
      `Le compte ${ROLES.find((r) => r.id === role)?.label.toLowerCase()} de ${fullName.trim()} a été créé.`
    );
    setCreating(false);
    if (ok) {
      setFullName('');
      setEmail('');
      setPassword('');
    }
  };

  const submitTrack = () => {
    const c = code.trim().toUpperCase();
    if (!c || !label.trim()) {
      Alert.alert('Champs requis', 'Code (ex : 3AS) et nom de la classe.');
      return;
    }
    const slug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    run(
      () => createTrack({ id: slug, code: c, label: label.trim(), shortLabel: label.trim(), level, mainCategoryIds: [], order: tracks.length }),
      `La classe ${c} a été ajoutée.`
    ).then((ok) => {
      if (ok) {
        setCode('');
        setLabel('');
      }
    });
  };

  const removeTrack = (id: string, c: string) => {
    Alert.alert('Supprimer la classe ?', `${c} ne sera plus proposée aux élèves.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => run(() => deleteTrack(id), `${c} a été supprimée.`) },
    ]);
  };

  return (
    <ScreenContainer scroll edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <Avatar uri={user?.avatar ?? ''} size={56} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{user?.fullName}</Text>
          <Text style={[styles.email, { color: theme.colors.textMuted }]}>{user?.email}</Text>
        </View>
      </Animated.View>

      {isDirector ? (
        <>
          <Section icon="person-add-outline" title="Créer un compte" subtitle="Élève, professeur, admin ou directeur" delay={60}>
            <View style={styles.wrap}>
              {ROLES.map((r) => (
                <Chip key={r.id} label={r.label} selected={role === r.id} onPress={() => setRole(r.id)} />
              ))}
            </View>
            <Field value={fullName} onChangeText={setFullName} placeholder="Nom complet" icon="person-outline" />
            <Field value={email} onChangeText={setEmail} placeholder="Email" icon="mail-outline" keyboard="email-address" />
            <Field value={password} onChangeText={setPassword} placeholder="Mot de passe (8+ caractères)" icon="lock-closed-outline" secure />
            {role === 'teacher' && <Field value={share} onChangeText={setShare} placeholder="% reversé au professeur" icon="pie-chart-outline" keyboard="number-pad" />}
            <Button label="Créer le compte" icon="checkmark-circle-outline" loading={creating} onPress={submitAccount} style={{ marginTop: 4 }} />
          </Section>

          <Section icon="school-outline" title="Filières & classes" subtitle="Du primaire au Bac — visibles par tous les élèves" delay={100}>
            {LEVELS.map((l) => {
              const list = tracksForLevel(tracks, l.id);
              return (
                <View key={l.id} style={{ marginBottom: 10 }}>
                  <Text style={[styles.levelLabel, { color: l.gradient[1] }]}>{l.label}</Text>
                  <View style={styles.wrap}>
                    {list.map((t) => (
                      <Pressable key={t.id} onLongPress={() => removeTrack(t.id, t.code)} style={[styles.trackPill, { backgroundColor: `${l.gradient[0]}22` }]}>
                        <Text style={[styles.trackPillText, { color: l.gradient[1] }]}>{t.code}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>Appui long sur une classe pour la supprimer.</Text>
            <View style={[styles.wrap, { marginTop: 10 }]}>
              {LEVELS.map((l) => (
                <Chip key={l.id} label={l.label} selected={level === l.id} onPress={() => setLevel(l.id)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 110 }}>
                <Field value={code} onChangeText={setCode} placeholder="Code" icon="pricetag-outline" />
              </View>
              <View style={{ flex: 1 }}>
                <Field value={label} onChangeText={setLabel} placeholder="Nom (ex : 3ème AS)" icon="text-outline" />
              </View>
            </View>
            <Button label="Ajouter la classe" icon="add" variant="outline" onPress={submitTrack} />
          </Section>

          <Section icon="calendar-outline" title="Trimestres" subtitle="Les cours se débloquent à la date de début" delay={140}>
            {terms.map((t) => (
              <View key={t.number} style={{ marginBottom: 10 }}>
                <Text style={[styles.levelLabel, { color: theme.colors.text }]}>
                  {t.label} {t.isCurrent ? '· en cours' : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Field
                      value={termDrafts[t.number]?.startDate ?? ''}
                      onChangeText={(v) => setTermDrafts((d) => ({ ...d, [t.number]: { ...d[t.number], startDate: v } }))}
                      placeholder="Début AAAA-MM-JJ"
                      icon="play-outline"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field
                      value={termDrafts[t.number]?.endDate ?? ''}
                      onChangeText={(v) => setTermDrafts((d) => ({ ...d, [t.number]: { ...d[t.number], endDate: v } }))}
                      placeholder="Fin AAAA-MM-JJ"
                      icon="stop-outline"
                    />
                  </View>
                </View>
              </View>
            ))}
            <Button
              label="Enregistrer les trimestres"
              variant="outline"
              icon="save-outline"
              onPress={() =>
                run(() => Promise.all(Object.entries(termDrafts).map(([n, d]) => updateTerm(Number(n), d))), 'Les dates des trimestres sont à jour.')
              }
            />
          </Section>

          <Section icon="settings-outline" title="Paiement & protection" subtitle="WhatsApp, numéros marchands, limites de vues" delay={180}>
            <Field value={whatsapp} onChangeText={setWhatsapp} placeholder="WhatsApp (ex : 22236000000)" icon="logo-whatsapp" keyboard="phone-pad" />
            {['Bankily', 'Masrvi', 'Sedad', 'Click'].map((m) => (
              <Field
                key={m}
                value={merchants[m] ?? ''}
                onChangeText={(v) => setMerchants((prev) => ({ ...prev, [m]: v }))}
                placeholder={`Numéro marchand ${m}`}
                icon="phone-portrait-outline"
                keyboard="phone-pad"
              />
            ))}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hint, { color: theme.colors.textMuted, marginBottom: 4 }]}>Vues / leçon (packs)</Text>
                <Field value={maxViews} onChangeText={setMaxViews} placeholder="4" icon="eye-outline" keyboard="number-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hint, { color: theme.colors.textMuted, marginBottom: 4 }]}>Vues / leçon (offre prof)</Text>
                <Field value={teacherViews} onChangeText={setTeacherViews} placeholder="2" icon="eye-outline" keyboard="number-pad" />
              </View>
            </View>
            <Button
              label="Enregistrer les paramètres"
              variant="outline"
              icon="save-outline"
              onPress={() =>
                run(
                  () =>
                    updateSettings({
                      whatsappNumber: whatsapp.trim(),
                      merchantNumbers: merchants,
                      defaultMaxViews: Number(maxViews) || 4,
                      teacherOfferMaxViews: Number(teacherViews) || 2,
                    }),
                  'Les paramètres sont enregistrés.'
                )
              }
            />
          </Section>
        </>
      ) : (
        <Animated.View entering={FadeInDown.delay(60).springify()} style={[styles.section, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Compte administrateur</Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textMuted, marginTop: 6 }]}>
            Vous validez les paiements, gérez les promos et pouvez fermer les packs d'un professeur. La création de comptes, de filières et le réglage des trimestres sont réservés au directeur.
          </Text>
        </Animated.View>
      )}

      <Button label="Déconnexion" icon="log-out-outline" variant="danger" onPress={logout} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 18 },
  name: { fontSize: 20, fontWeight: '800' },
  email: { fontSize: 13, marginTop: 2 },
  section: { borderRadius: 22, padding: 16, marginBottom: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionSub: { fontSize: 12.5, marginTop: 2, lineHeight: 18 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 46, marginBottom: 8 },
  fieldInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  levelLabel: { fontSize: 12.5, fontWeight: '800', marginBottom: 6 },
  trackPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  trackPillText: { fontSize: 12.5, fontWeight: '800' },
  hint: { fontSize: 11.5, fontWeight: '600' },
});
