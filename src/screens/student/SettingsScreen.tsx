import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { ScreenContainer } from '../../components/layout';
import { IconButton } from '../../components/ui';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);

  const Row: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: boolean; onChange: (v: boolean) => void }> = ({
    icon,
    label,
    value,
    onChange,
  }) => (
    <View style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Paramètres</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>APPARENCE</Text>
      <Row icon="moon-outline" label="Mode sombre" value={isDark} onChange={toggleTheme} />

      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>NOTIFICATIONS</Text>
      <Row icon="notifications-outline" label="Notifications push" value={notifications} onChange={setNotifications} />
      <Row icon="mail-outline" label="E-mails promotionnels" value={emailUpdates} onChange={setEmailUpdates} />

      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>TÉLÉCHARGEMENTS</Text>
      <Row icon="download-outline" label="Téléchargement automatique en Wi-Fi" value={autoDownload} onChange={setAutoDownload} />

      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>À PROPOS</Text>
      <Pressable style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <Ionicons name="document-text-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Conditions d'utilisation</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </Pressable>
      <Pressable style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <Ionicons name="shield-outline" size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Politique de confidentialité</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </Pressable>
      <Text style={[styles.version, { color: theme.colors.textMuted }]}>EduConnect v1.0.0</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 12 },
  title: { fontSize: 19, fontWeight: '700', marginLeft: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 18, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10 },
  rowLabel: { flex: 1, marginLeft: 14, fontSize: 13.5, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 11.5, marginTop: 20, marginBottom: 10 },
});
