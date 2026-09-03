import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { ScreenContainer } from '../../components/layout';
import { Avatar, Badge, EmptyState } from '../../components/ui';
import { liveSessions } from '../../data';
import { LiveSession } from '../../types';
import { formatDateTime } from '../../utils/formatters';

type Props = StudentTabScreenProps<'Live'>;

export const LiveListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const live = liveSessions.filter((l) => l.status === 'live');
  const upcoming = liveSessions.filter((l) => l.status === 'upcoming');
  const ended = liveSessions.filter((l) => l.status === 'ended');

  const renderLiveCard = ({ item }: { item: LiveSession }) => (
    <Pressable onPress={() => navigation.navigate('LiveRoom', { liveId: item.id })} style={styles.liveCardWrap}>
      <Image source={{ uri: item.thumbnail }} style={styles.liveImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.liveGradient} />
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>EN DIRECT</Text>
      </View>
      <View style={styles.liveViewers}>
        <Ionicons name="eye" size={12} color="#fff" />
        <Text style={styles.liveViewersText}>{item.viewersCount}</Text>
      </View>
      <View style={styles.liveInfo}>
        <Text numberOfLines={1} style={styles.liveTitle}>{item.title}</Text>
        <Text style={styles.liveTeacher}>{item.teacherName}</Text>
      </View>
    </Pressable>
  );

  const renderScheduledRow = (item: LiveSession, key: string) => (
    <Pressable key={key} onPress={() => navigation.navigate('LiveRoom', { liveId: item.id })} style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
      <Image source={{ uri: item.thumbnail }} style={styles.rowImage} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={2} style={[styles.rowTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <View style={styles.rowMeta}>
          <Avatar uri={item.teacherAvatar} size={18} />
          <Text style={[styles.rowTeacher, { color: theme.colors.textSecondary }]}>{item.teacherName}</Text>
        </View>
        <Text style={[styles.rowDate, { color: theme.colors.textMuted }]}>{formatDateTime(item.scheduledAt)}</Text>
      </View>
      {item.status === 'upcoming' ? (
        <Badge label="À venir" tone="info" small />
      ) : (
        <Badge label="Terminé" tone="neutral" small />
      )}
    </Pressable>
  );

  return (
    <ScreenContainer scroll edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Sessions Live</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Échangez en direct avec vos formateurs</Text>

      {live.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🔴 En direct maintenant</Text>
          <FlatList
            horizontal
            data={live}
            keyExtractor={(l) => l.id}
            showsHorizontalScrollIndicator={false}
            renderItem={renderLiveCard}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>À venir</Text>
      {upcoming.length === 0 ? (
        <EmptyState icon="calendar-outline" title="Aucune session prévue" description="Revenez plus tard pour découvrir les prochains lives." />
      ) : (
        <View style={{ marginBottom: 20 }}>{upcoming.map((l) => renderScheduledRow(l, l.id))}</View>
      )}

      {ended.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Replays</Text>
          {ended.map((l) => renderScheduledRow(l, l.id))}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 21, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },
  sectionTitle: { fontSize: 15.5, fontWeight: '800', marginBottom: 12 },
  liveCardWrap: { width: 240, height: 150, borderRadius: 18, overflow: 'hidden', marginRight: 14 },
  liveImage: { width: '100%', height: '100%', position: 'absolute' },
  liveGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  liveBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginRight: 4 },
  liveBadgeText: { color: '#fff', fontSize: 9.5, fontWeight: '800' },
  liveViewers: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  liveViewersText: { color: '#fff', fontSize: 10, fontWeight: '700', marginLeft: 4 },
  liveInfo: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  liveTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  liveTeacher: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, marginBottom: 12 },
  rowImage: { width: 64, height: 64, borderRadius: 12 },
  rowTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  rowTeacher: { fontSize: 11.5, marginLeft: 6 },
  rowDate: { fontSize: 11, marginTop: 4 },
});
