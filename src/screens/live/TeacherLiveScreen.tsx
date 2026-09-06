import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/layout';
import { Badge, Button, EmptyState, IconButton } from '../../components/ui';
import { useLive } from '../../context/LiveContext';
import { Teacher, LiveSession } from '../../types';
import { formatDateTime } from '../../utils/formatters';

type Props = TeacherDrawerScreenProps<'TeacherLive'>;

export const TeacherLiveScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { liveSessions } = useLive();
  const teacher = user as Teacher;
  const myLives = liveSessions.filter((l) => l.teacherId === teacher?.id);

  const statusTone = (status: LiveSession['status']) => (status === 'live' ? 'danger' : status === 'upcoming' ? 'info' : 'neutral');
  const statusLabel = (status: LiveSession['status']) => (status === 'live' ? 'En direct' : status === 'upcoming' ? 'À venir' : 'Terminé');

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes sessions Live</Text>
      </View>

      <Button label="Planifier un nouveau live" icon="add-circle-outline" onPress={() => navigation.navigate('ScheduleLive')} style={{ marginBottom: 20 }} />

      <FlatList
        data={myLives}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('LiveRoom', { liveId: item.id })}
            style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.image} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.rowTop}>
                <Badge label={statusLabel(item.status)} tone={statusTone(item.status) as any} small />
                {item.status === 'live' && (
                  <View style={styles.viewersRow}>
                    <Ionicons name="eye-outline" size={12} color={theme.colors.textMuted} />
                    <Text style={[styles.viewersText, { color: theme.colors.textMuted }]}>{item.viewersCount}</Text>
                  </View>
                )}
              </View>
              <Text numberOfLines={2} style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardDate, { color: theme.colors.textMuted }]}>{formatDateTime(item.scheduledAt)}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState icon="radio-outline" title="Aucune session live" description="Planifiez votre première session en direct avec vos étudiants." />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', marginLeft: 4 },
  card: { flexDirection: 'row', padding: 10, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  image: { width: 72, height: 72, borderRadius: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  viewersRow: { flexDirection: 'row', alignItems: 'center' },
  viewersText: { fontSize: 11, marginLeft: 3 },
  cardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  cardDate: { fontSize: 11, marginTop: 4 },
});
