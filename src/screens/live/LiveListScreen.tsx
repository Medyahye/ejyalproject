import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { StudentTabScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { ScreenContainer } from '../../components/layout';
import { Avatar, Badge, EmptyState, PulsingDot } from '../../components/ui';
import { useLive } from '../../context/LiveContext';
import { LiveSession } from '../../types';
import { formatDateTime } from '../../utils/formatters';

type Props = StudentTabScreenProps<'Live'>;

export const LiveListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { liveSessions, refresh } = useLive();
  const live = liveSessions.filter((l) => l.status === 'live');
  const upcoming = liveSessions.filter((l) => l.status === 'upcoming');
  const ended = liveSessions.filter((l) => l.status === 'ended');

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
      const interval = setInterval(() => {
        refresh().catch(() => {});
      }, 15000);
      return () => clearInterval(interval);
    }, [refresh])
  );

  const renderLiveCard = ({ item, index }: { item: LiveSession; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable onPress={() => navigation.navigate('LiveRoom', { liveId: item.id })} style={styles.liveCardWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.liveImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.liveGradient} />
        <View style={styles.liveBadge}>
          <PulsingDot size={6} color="#fff" style={{ marginRight: 5 }} />
          <Text style={styles.liveBadgeText}>EN DIRECT</Text>
        </View>
        <View style={styles.liveViewers}>
          <Ionicons name="eye" size={13} color="#fff" />
          <Text style={styles.liveViewersText}>{item.viewersCount}</Text>
        </View>
        <View style={styles.liveInfo}>
          <Text numberOfLines={1} style={styles.liveTitle}>{item.title}</Text>
          <Text style={styles.liveTeacher}>{item.teacherName}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderScheduledRow = (item: LiveSession, key: string, index: number) => (
    <Animated.View key={key} entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable onPress={() => navigation.navigate('LiveRoom', { liveId: item.id })} style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <Image source={{ uri: item.thumbnail }} style={styles.rowImage} />
        <View style={{ flex: 1, marginLeft: 13 }}>
          <Text numberOfLines={2} style={[styles.rowTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <View style={styles.rowMeta}>
            <Avatar uri={item.teacherAvatar} size={19} />
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
    </Animated.View>
  );

  return (
    <ScreenContainer scroll edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Sessions Live</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Échangez en direct avec vos formateurs</Text>
      </Animated.View>

      {live.length > 0 && (
        <View style={{ marginBottom: 26 }}>
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
        <View style={{ marginBottom: 22 }}>{upcoming.map((l, i) => renderScheduledRow(l, l.id, i))}</View>
      )}

      {ended.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Replays</Text>
          {ended.map((l, i) => renderScheduledRow(l, l.id, i))}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 23, fontWeight: '700', marginTop: 8, marginBottom: 5 },
  subtitle: { fontSize: 14.5, marginBottom: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 13 },
  liveCardWrap: { width: 250, height: 156, borderRadius: 18, overflow: 'hidden', marginRight: 14 },
  liveImage: { width: '100%', height: '100%', position: 'absolute' },
  liveGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' },
  liveBadge: { position: 'absolute', top: 11, left: 11, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  liveBadgeText: { color: '#fff', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  liveViewers: { position: 'absolute', top: 11, right: 11, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  liveViewersText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  liveInfo: { position: 'absolute', bottom: 11, left: 11, right: 11 },
  liveTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  liveTeacher: { color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 3 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: 16, marginBottom: 13 },
  rowImage: { width: 68, height: 68, borderRadius: 13 },
  rowTitle: { fontSize: 14.5, fontWeight: '700', lineHeight: 19 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  rowTeacher: { fontSize: 12.5, marginLeft: 7 },
  rowDate: { fontSize: 12, marginTop: 5 },
});
