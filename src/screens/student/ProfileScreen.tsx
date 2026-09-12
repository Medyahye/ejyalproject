import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
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
import { getGradeTrackInfo } from '../../constants/gradeTracks';
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
  const trackInfo = FEATURES.gradeTrack ? getGradeTrackInfo(student?.gradeTrack) : undefined;

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
          <Avatar uri={student?.avatar} size={84} ring />
        </Animated.View>
        {isEditing ? (
          <View style={{ width: '100%', marginTop: 16 }}>
            <Input value={fullName} onChangeText={setFullName} placeholder="Nom complet" style={{ textAlign: 'center' }} />
          </View>
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
              <Button label="Annuler" variant="outline" onPress={() => setIsEditing(false)} style={{ flex: 1 }} />
              <Button label="Enregistrer" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <Button label="Modifier le profil" variant="outline" icon="create-outline" onPress={() => setIsEditing(true)} style={{ marginBottom: 20 }} />
          </Animated.View>
        )}

        {menuItems.map((item, i) => (
          <Animated.View key={item.label} entering={FadeInDown.delay(220 + i * 60).springify()}>
            <Pressable onPress={item.onPress} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name={item.icon} size={19} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>{item.subtitle}</Text>
              </View>
              {typeof item.count === 'number' && item.count > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.primarySoft }]}>
                  <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '700' }}>{item.count}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))}

        {FEATURES.gradeTrack && (
          <Pressable
            onPress={() => setTrackSheetOpen(true)}
            style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name={trackInfo?.icon ?? 'school-outline'} size={19} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Ma filière</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>{trackInfo ? trackInfo.label : 'Non définie'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        )}

        <Animated.Text entering={FadeInDown.delay(400).springify()} style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
          PARAMÈTRES
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(440).springify()}>
          <View style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="moon-outline" size={19} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Mode sombre</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>Activer l'affichage sombre</Text>
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
              <Ionicons name="settings-outline" size={19} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Tous les paramètres</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>Notifications, téléchargements...</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(520).springify()}>
          <Pressable
            onPress={() => Alert.alert('Aide', 'Contactez-nous à support@educonnect.mr')}
            style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primarySoft }]}>
              <Ionicons name="help-circle-outline" size={19} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Aide & Support</Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.textMuted }]}>Une question ? Contactez-nous</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(560).springify()}>
          <Pressable onPress={logout} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm'), marginTop: 8 }]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="log-out-outline" size={19} color={theme.colors.danger} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.colors.danger, marginLeft: 12 }]}>Déconnexion</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>

    {FEATURES.gradeTrack && (
      <GradeTrackSheet
        visible={trackSheetOpen}
        currentTrack={student?.gradeTrack}
        onSelect={handleSelectTrack}
        onClose={() => setTrackSheetOpen(false)}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  name: { fontSize: 19, fontWeight: '700', color: '#fff', marginTop: 14 },
  email: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 10, marginBottom: 10 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 13.5, fontWeight: '700' },
  menuSubtitle: { fontSize: 11, marginTop: 2 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginRight: 8 },
});
