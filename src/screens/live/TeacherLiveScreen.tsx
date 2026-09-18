import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/layout';
import { Badge, Button, EmptyState, IconButton, PulsingDot } from '../../components/ui';
import { useLive } from '../../context/LiveContext';
import { Teacher, LiveSession } from '../../types';
import { formatDateTime } from '../../utils/formatters';

type Props = TeacherDrawerScreenProps<'TeacherLive'>;

export const TeacherLiveScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { liveSessions, refresh } = useLive();
  const teacher = user as Teacher;
  const myLives = liveSessions.filter((l) => l.teacherId === teacher?.id);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh])
  );

  const statusTone = (status: LiveSession['status']) => (status === 'live' ? 'danger' : status === 'upcoming' ? 'info' : 'neutral');
  const statusLabel = (status: LiveSession['status']) => (status === 'live' ? 'En direct' : status === 'upcoming' ? 'À venir' : 'Terminé');

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mes sessions Live</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).springify()}>
        <Button label="Planifier un nouveau live" icon="add-circle-outline" size="lg" onPress={() => navigation.navigate('ScheduleLive')} style={{ marginBottom: 22 }} />
      </Animated.View>

      <FlatList
        data={myLives}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(80 + Math.min(index, 8) * 50).springify()}>
            <Pressable
              onPress={() => navigation.navigate('LiveRoom', { liveId: item.id })}
              style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.image} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.rowTop}>
                  <View style={styles.statusWrap}>
                    {item.status === 'live' && <PulsingDot size={7} color="#FF6B6B" />}
                    <Badge label={statusLabel(item.status)} tone={statusTone(item.status) as any} small />
                  </View>
                  {item.status === 'live' && (
                    <View style={styles.viewersRow}>
                      <Ionicons name="eye-outline" size={13} color={theme.colors.textMuted} />
                      <Text style={[styles.viewersText, { color: theme.colors.textMuted }]}>{item.viewersCount}</Text>
                    </View>
                  )}
                </View>
                <Text numberOfLines={2} style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardDate, { color: theme.colors.textMuted }]}>{formatDateTime(item.scheduledAt)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState icon="radio-outline" title="Aucune session live" description="Planifiez votre première session en direct avec vos étudiants." />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 22 },
  title: { fontSize: 20.5, fontWeight: '700', marginLeft: 4 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginBottom: 13 },
  image: { width: 78, height: 78, borderRadius: 13 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewersRow: { flexDirection: 'row', alignItems: 'center' },
  viewersText: { fontSize: 12, marginLeft: 4, fontWeight: '600' },
  cardTitle: { fontSize: 14.5, fontWeight: '700', lineHeight: 19 },
  cardDate: { fontSize: 12.5, marginTop: 5 },
});
