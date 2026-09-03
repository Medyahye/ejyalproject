import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useStudentData } from '../../context/StudentDataContext';
import { Avatar, Input, Button } from '../../components/ui';
import { Student } from '../../types';

type Props = StudentTabScreenProps<'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { purchasedCourseIds, favoriteIds, cartItems } = useStudentData();
  const student = user as Student;
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(student?.fullName ?? '');
  const [bio, setBio] = useState(student?.bio ?? '');

  const handleSave = () => {
    updateProfile({ fullName, bio });
    setIsEditing(false);
    Alert.alert('Profil mis à jour', 'Vos informations ont été enregistrées.');
  };

  const menuItems: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; count?: number }> = [
    { icon: 'play-circle-outline', label: 'Mes cours', count: purchasedCourseIds.length, onPress: () => navigation.navigate('MyCourses') },
    { icon: 'heart-outline', label: 'Mes favoris', count: favoriteIds.length, onPress: () => navigation.navigate('Favorites') },
    { icon: 'cart-outline', label: 'Mon panier', count: cartItems.length, onPress: () => navigation.navigate('Cart') },
    { icon: 'radio-outline', label: 'Sessions Live', onPress: () => navigation.navigate('Live') },
    { icon: 'settings-outline', label: 'Paramètres', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle-outline', label: "Aide & Support", onPress: () => Alert.alert('Aide', 'Contactez-nous à support@educonnect.io') },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <Avatar uri={student?.avatar} size={84} ring />
        {isEditing ? (
          <View style={{ width: '100%', marginTop: 16 }}>
            <Input value={fullName} onChangeText={setFullName} placeholder="Nom complet" style={{ textAlign: 'center' }} />
          </View>
        ) : (
          <>
            <Text style={styles.name}>{student?.fullName}</Text>
            <Text style={styles.email}>{student?.email}</Text>
          </>
        )}
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{purchasedCourseIds.length}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Cours achetés</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{favoriteIds.length}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Favoris</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>12</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Certificats</Text>
        </View>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View>
            <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Parlez de vous..." multiline style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Button label="Annuler" variant="outline" onPress={() => setIsEditing(false)} style={{ flex: 1 }} />
              <Button label="Enregistrer" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <Button label="Modifier le profil" variant="outline" icon="create-outline" onPress={() => setIsEditing(true)} style={{ marginBottom: 20 }} />
        )}

        {menuItems.map((item) => (
          <Pressable key={item.label} onPress={item.onPress} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <Ionicons name={item.icon} size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
            {typeof item.count === 'number' && item.count > 0 && (
              <View style={[styles.countBadge, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '800' }}>{item.count}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}

        <Pressable onPress={logout} style={[styles.menuRow, { backgroundColor: theme.colors.card, ...theme.shadow('sm'), marginTop: 8 }]}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
          <Text style={[styles.menuLabel, { color: theme.colors.danger }]}>Déconnexion</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  name: { fontSize: 19, fontWeight: '800', color: '#fff', marginTop: 14 },
  email: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -24, marginBottom: 8, gap: 12 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10.5, marginTop: 4, fontWeight: '600' },
  content: { padding: 20 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 14, marginBottom: 10 },
  menuLabel: { flex: 1, marginLeft: 14, fontSize: 13.5, fontWeight: '700' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginRight: 8 },
});
