import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { Avatar, Input, Button } from '../../components/ui';
import { GradeTrackSheet } from '../../components/student/GradeTrackSheet';
import { Student, GradeTrack } from '../../types';
import { getLevelInfo } from '../../constants/levels';
import { useCatalog } from '../../context/CatalogContext';
import { FEATURES } from '../../constants/features';

type Props = StudentTabScreenProps<'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { purchasedCourseIds, favoriteIds, cartItems } = useStudentData();
  const student = user as Student;
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(student?.fullName ?? '');
  const [bio, setBio] = useState(student?.bio ?? '');
  const [trackSheetOpen, setTrackSheetOpen] = useState(false);
  const { tracks, getTrack } = useCatalog();
  const trackInfo = FEATURES.gradeTrack ? getTrack(student?.gradeTrack) : undefined;
  const levelInfo = getLevelInfo(trackInfo?.level);

  const handleSelectTrack = (track: GradeTrack) => {
    updateProfile({ gradeTrack: track } as Partial<Student>);
    setTrackSheetOpen(false);
  };

  const handleSave = () => {
    updateProfile({ fullName, bio });
    setIsEditing(false);
    Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.');
  };

  const menuItems: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; subtitle: string; onPress: () => void; count?: number }> = [
    { icon: 'play-circle-outline', label: 'Mes cours', subtitle: 'Cours achetés et progression', count: purchasedCourseIds.length, onPress: () => navigation.navigate('MyCourses') },
    { icon: 'heart-outline', label: 'Mes favoris', subtitle: 'Cours enregistrés', count: favoriteIds.length, onPress: () => navigation.navigate('Favorites') },
    { icon: 'cart-outline', label: 'Mon panier', subtitle: 'Avant de passer au paiement', count: cartItems.length, onPress: () => navigation.navigate('Cart') },
  ];

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <Animated.View entering={ZoomIn.delay(40).springify()}>
          <Avatar uri={student?.avatar} size={96} ring />
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
            <Text style={styles.email}>{student?.email}</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(120).springify()} style={{ alignItems: 'center' }}>
            <Text style={styles.name}>{student?.fullName}</Text>
            <Text style={styles.email}>{student?.email}</Text>
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        {isEditing ? (
          <View>
            <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Parlez de vous..." multiline />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Button label="Annuler" variant="outline" size="lg" onPress={() => setIsEditing(false)} style={{ flex: 1 }} />
              <Button label="Enregistrer" size="lg" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <Button label="Modifier le profil" variant="outline" size="lg" icon="create-outline" onPress={() => setIsEditing(true)} style={{ marginBottom: 22 }} />
          </Animated.View>
        )}

        {menuItems.map((item, i) => (
          <Animated.View key={item.label} entering={FadeInDown.delay(220 + i * 60).springify()}>
            <Pressable onPress={item.onPress} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
              </View>
              {typeof item.count === 'number' && item.count > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.primarySoft }]}>
                  <Text style={{ color: theme.colors.primary, fontSize: 12.5, fontWeight: '700' }}>{item.count}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))}

        {FEATURES.gradeTrack && (
          <Pressable
            onPress={() => setTrackSheetOpen(true)}
            style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: levelInfo ? `${levelInfo.gradient[0]}26` : theme.colors.primarySoft }]}>
              <Ionicons name={levelInfo?.icon ?? 'school-outline'} size={22} color={levelInfo?.gradient[1] ?? theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Ma classe</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>{trackInfo ? trackInfo.label : 'Non définie'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </Pressable>
        )}

        <Animated.Text entering={FadeInDown.delay(400).springify()} style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
          PARAMÈTRES
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(440).springify()}>
          <View style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="moon-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Mode sombre</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(480).springify()}>
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="settings-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Tous les paramètres</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(520).springify()}>
          <Pressable
            onPress={() => Alert.alert('Aide', 'Contactez-nous à support@educonnect.mr')}
            style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="help-circle-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Aide & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(560).springify()}>
          <Pressable onPress={logout} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm'), marginTop: 8 }]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.colors.danger, marginLeft: 14 }]}>Déconnexion</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>

    {FEATURES.gradeTrack && (
      <GradeTrackSheet
        visible={trackSheetOpen}
        tracks={tracks}
        currentTrack={student?.gradeTrack}
        onSelect={handleSelectTrack}
        onClose={() => setTrackSheetOpen(false)}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 76, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  name: { fontSize: 23, fontWeight: '700', color: '#fff', marginTop: 16 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
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
  content: { padding: 20 },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', letterSpacing: 0.5, marginTop: 12, marginBottom: 12 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  menuIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15.5, fontWeight: '700' },
  menuSubtitle: { fontSize: 12.5, marginTop: 3 },
  countBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginRight: 10 },
});
