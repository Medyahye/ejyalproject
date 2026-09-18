import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTeacherData } from '../../context/TeacherDataContext';
import { useCatalog } from '../../context/CatalogContext';
import { Avatar, Input, Button, IconButton, Badge } from '../../components/ui';
import { TeachingSubjectsSheet } from '../../components/teacher/TeachingSubjectsSheet';
import { Teacher } from '../../types';
import { formatPrice } from '../../utils/formatters';

type Props = TeacherDrawerScreenProps<'TeacherProfile'>;

export const TeacherProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { myCourses } = useTeacherData();
  const { categories } = useCatalog();
  const teacher = user as Teacher;
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(teacher?.fullName ?? '');
  const [headline, setHeadline] = useState(teacher?.headline ?? '');
  const [bio, setBio] = useState(teacher?.bio ?? '');
  const [subjectsSheetOpen, setSubjectsSheetOpen] = useState(false);
  const myCategories = categories.filter((c) => teacher?.teachingCategoryIds?.includes(c.id));

  const handleSave = () => {
    updateProfile({ fullName, headline, bio } as Partial<Teacher>);
    setIsEditing(false);
    Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.');
  };

  const handleSaveSubjects = (ids: string[]) => {
    updateProfile({ teachingCategoryIds: ids } as Partial<Teacher>);
    setSubjectsSheetOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" color="#fff" style={styles.menuBtn} />
        <Animated.View entering={ZoomIn.delay(40).springify()}>
          <Avatar uri={teacher?.avatar} size={96} ring />
        </Animated.View>
        {isEditing ? (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.nameEditWrap}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nom complet"
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.nameEditInput}
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(120).springify()} style={{ alignItems: 'center' }}>
            <Text style={styles.name}>{teacher?.fullName}</Text>
            <Text style={styles.headline} numberOfLines={2}>{teacher?.headline}</Text>
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.statsRow}>
        <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{myCourses.length}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Packages</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(220).springify()} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{teacher?.totalStudents.toLocaleString('fr-FR')}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Étudiants</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(260).springify()} style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{teacher?.rating.toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Note</Text>
        </Animated.View>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View>
            <Input label="Titre professionnel" value={headline} onChangeText={setHeadline} placeholder="Ex : Ingénieur Full-Stack" />
            <Input label="Bio" value={bio} onChangeText={setBio} multiline />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Button label="Annuler" variant="outline" size="lg" onPress={() => setIsEditing(false)} style={{ flex: 1 }} />
              <Button label="Enregistrer" size="lg" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Button label="Modifier le profil" variant="outline" size="lg" icon="create-outline" onPress={() => setIsEditing(true)} style={{ marginBottom: 22 }} />

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>À propos</Text>
            <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>{teacher?.bio}</Text>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spécialités</Text>
            <View style={styles.tagsRow}>
              {teacher?.specialties.map((s) => (
                <Badge key={s} label={s} tone="primary" />
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(330).springify()}>
          <Pressable
            onPress={() => setSubjectsSheetOpen(true)}
            style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm'), marginTop: 10 }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="school-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Mes matières</Text>
              <Text numberOfLines={1} style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>
                {myCategories.length ? myCategories.map((c) => c.name).join(' · ') : 'Non définies'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).springify()}>
          <Pressable onPress={logout} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm'), marginTop: 12 }]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.colors.danger, marginLeft: 14 }]}>Déconnexion</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>

    <TeachingSubjectsSheet
      key={(teacher?.teachingCategoryIds ?? []).join(',')}
      visible={subjectsSheetOpen}
      categories={categories}
      currentIds={teacher?.teachingCategoryIds ?? []}
      onSave={handleSaveSubjects}
      onClose={() => setSubjectsSheetOpen(false)}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 76, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  menuBtn: { position: 'absolute', top: 50, left: 16 },
  name: { fontSize: 23, fontWeight: '700', color: '#fff', marginTop: 16 },
  headline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  nameEditWrap: { alignItems: 'center', width: '100%', marginTop: 16, paddingHorizontal: 32 },
  nameEditInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -24, marginBottom: 8, gap: 12 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18, borderRadius: 16 },
  statValue: { fontSize: 19, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 5, fontWeight: '600' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 10 },
  bio: { fontSize: 14.5, lineHeight: 22, marginBottom: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16 },
  menuIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15.5, fontWeight: '700' },
  menuSubtitle: { fontSize: 12.5, marginTop: 3 },
});
