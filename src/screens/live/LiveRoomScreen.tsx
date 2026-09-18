import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Button, PulsingDot } from '../../components/ui';
import { useLive } from '../../context/LiveContext';
import {
  fetchLiveChat,
  fetchLiveSession,
  postLiveChatMessage,
  joinLiveSession,
  leaveLiveSession,
  reactToLiveSession,
  startLiveSession,
  endLiveSession,
} from '../../api/live';
import { LiveChatMessage, LiveSession } from '../../types';
import { haptics } from '../../utils/haptics';

type RoomRoute = RouteProp<{ LiveRoom: { liveId: string } }, 'LiveRoom'>;

const AnimatedImage = Animated.createAnimatedComponent(Image);

const FloatingHeart: React.FC<{ onDone: () => void; xOffset: number }> = ({ onDone, xOffset }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: -progress.value * 130 },
      { translateX: xOffset * progress.value },
      { scale: 0.6 + progress.value * 0.7 },
    ],
  }));

  return (
    <Animated.View style={[styles.floatingHeart, style]} pointerEvents="none">
      <Ionicons name="heart" size={22} color="#FF6B6B" />
    </Animated.View>
  );
};

function formatCountdown(scheduledAt: string, now: number): string {
  const diffMs = new Date(scheduledAt).getTime() - now;
  if (diffMs <= 0) return 'Le direct va bientôt commencer';
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Le direct va bientôt commencer';
  if (mins < 60) return `Dans ${mins} min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `Dans ${hours} h${remMins > 0 ? ` ${remMins} min` : ''}`;
}

export const LiveRoomScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<RoomRoute>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { liveSessions } = useLive();
  const liveId = route.params.liveId;

  const [live, setLive] = useState<LiveSession | undefined>(
    () => liveSessions.find((l) => l.id === liveId) ?? liveSessions[0]
  );
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [statusChanging, setStatusChanging] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const heartSeq = useRef(0);

  const isTeacherView = !!user && !!live && user.id === live.teacherId;
  const isLive = live?.status === 'live';

  // Keep in sync with the context list (e.g. right after navigating here).
  useEffect(() => {
    const found = liveSessions.find((l) => l.id === liveId);
    if (found) setLive(found);
  }, [liveSessions, liveId]);

  // Light polling so status / viewer count / reactions feel live without websockets.
  useEffect(() => {
    if (!liveId) return;
    const interval = setInterval(() => {
      fetchLiveSession(liveId).then(setLive).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, [liveId]);

  // Chat polling while the session is actually live.
  useEffect(() => {
    if (!liveId || !isLive) return;
    const interval = setInterval(() => {
      fetchLiveChat(liveId).then(setMessages).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [liveId, isLive]);

  useEffect(() => {
    if (!live) return;
    fetchLiveChat(live.id).then(setMessages).catch(() => setMessages([]));
  }, [live?.id]);

  // Count this viewer while they watch a live session (not the broadcasting teacher).
  useEffect(() => {
    if (!liveId || isTeacherView || !isLive) return;
    let joined = false;
    joinLiveSession(liveId)
      .then((updated) => {
        joined = true;
        setLive(updated);
      })
      .catch(() => {});
    return () => {
      if (joined) leaveLiveSession(liveId).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveId, isTeacherView, isLive]);

  useEffect(() => {
    if (live?.status !== 'upcoming') return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [live?.status]);

  const zoom = useSharedValue(0);
  useEffect(() => {
    zoom.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);
  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + zoom.value * 0.08 }] }));

  const countdownLabel = useMemo(() => (live ? formatCountdown(live.scheduledAt, now) : ''), [live, now]);

  if (!live) return null;

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    postLiveChatMessage(live.id, text)
      .then((sent) => setMessages((prev) => [...prev, sent]))
      .catch(() => {});
  };

  const handleReact = () => {
    if (!isLive || isTeacherView) return;
    haptics.tap();
    const id = heartSeq.current++;
    setHearts((h) => [...h, { id, x: Math.round((Math.random() - 0.5) * 44) }]);
    reactToLiveSession(live.id).then(setLive).catch(() => {});
  };
  const removeHeart = (id: number) => setHearts((h) => h.filter((x) => x.id !== id));

  const handleStart = async () => {
    setStatusChanging(true);
    try {
      setLive(await startLiveSession(live.id));
      haptics.success();
    } catch {
      Alert.alert('Impossible de démarrer', 'Une erreur est survenue, réessayez.');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleEnd = () => {
    Alert.alert('Terminer le direct', 'Voulez-vous vraiment mettre fin à cette session en direct ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer',
        style: 'destructive',
        onPress: async () => {
          setStatusChanging(true);
          try {
            setLive(await endLiveSession(live.id));
          } catch {
            Alert.alert('Impossible de terminer', 'Une erreur est survenue, réessayez.');
          } finally {
            setStatusChanging(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0E0E13' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.videoArea}>
        <AnimatedImage source={{ uri: live.thumbnail }} style={[StyleSheet.absoluteFill, zoomStyle]} blurRadius={isLive ? 0 : 4} />
        <LinearGradient colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />

        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="chevron-down" size={26} color="#fff" />
          </Pressable>
          <View style={styles.topBarRight}>
            {isLive && (
              <View style={styles.liveBadge}>
                <PulsingDot size={6} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.liveBadgeText}>EN DIRECT</Text>
              </View>
            )}
            <View style={styles.viewersBadge}>
              <Ionicons name="eye" size={13} color="#fff" />
              <Text style={styles.viewersText}>{live.viewersCount}</Text>
            </View>
          </View>
        </View>

        {live.status === 'upcoming' && (
          <View style={styles.centerOverlay}>
            <View style={styles.centerIconCircle}>
              <Ionicons name="time-outline" size={30} color="#fff" />
            </View>
            <Text style={styles.centerOverlayTitle}>{isTeacherView ? 'Votre session n\'a pas encore démarré' : 'Cette session n\'a pas encore commencé'}</Text>
            <Text style={styles.centerOverlayText}>{countdownLabel}</Text>
            {isTeacherView && (
              <Button label="Démarrer le direct" icon="radio" onPress={handleStart} loading={statusChanging} style={{ marginTop: 18, minWidth: 220 }} />
            )}
          </View>
        )}

        {live.status === 'ended' && (
          <View style={styles.centerOverlay}>
            <View style={styles.centerIconCircle}>
              <Ionicons name="checkmark-done" size={30} color="#fff" />
            </View>
            <Text style={styles.centerOverlayTitle}>Ce direct est terminé</Text>
            <Text style={styles.centerOverlayText}>
              {live.viewersCount} spectateur{live.viewersCount > 1 ? 's' : ''} · {live.reactionsCount} réaction{live.reactionsCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.teacherRow}>
          <Avatar uri={live.teacherAvatar} size={38} ring />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.teacherName}>{live.teacherName}</Text>
            <Text style={styles.courseTag}>{live.categoryName}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text numberOfLines={1} style={[styles.liveTitle, { color: theme.colors.text }]}>{live.title}</Text>

        {isTeacherView ? (
          isLive && (
            <Pressable onPress={handleEnd} style={[styles.endBtn, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="stop-circle-outline" size={16} color={theme.colors.danger} />
              <Text style={[styles.endBtnText, { color: theme.colors.danger }]}>Terminer</Text>
            </Pressable>
          )
        ) : (
          <View style={{ position: 'relative' }}>
            <Pressable onPress={handleReact} disabled={!isLive} style={[styles.reactionBtn, { opacity: isLive ? 1 : 0.4 }]}>
              <Ionicons name="heart" size={18} color={theme.colors.danger} />
              <Text style={[styles.reactionCount, { color: theme.colors.textSecondary }]}>{live.reactionsCount}</Text>
            </Pressable>
            <View style={styles.heartLayer} pointerEvents="none">
              {hearts.map((h) => (
                <FloatingHeart key={h.id} xOffset={h.x} onDone={() => removeHeart(h.id)} />
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={[styles.chatWrap, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8, flexGrow: 1 }}
          renderItem={({ item }) => (
            <View style={styles.chatRow}>
              <Avatar uri={item.avatar} size={28} />
              <View style={{ marginLeft: 9, flex: 1 }}>
                <View style={styles.chatNameRow}>
                  <Text style={[styles.chatName, { color: item.isTeacher ? theme.colors.primary : theme.colors.text }]}>{item.userName}</Text>
                  {item.isTeacher && <Badge label="Formateur" tone="primary" small />}
                  <Text style={[styles.chatTime, { color: theme.colors.textMuted }]}>{item.timestamp}</Text>
                </View>
                <Text style={[styles.chatMessage, { color: theme.colors.textSecondary }]}>{item.message}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Animated.View entering={FadeIn.delay(150)} style={styles.chatEmpty}>
              <Ionicons name="chatbubbles-outline" size={26} color={theme.colors.textMuted} />
              <Text style={[styles.chatEmptyText, { color: theme.colors.textMuted }]}>
                {isLive ? 'Soyez le premier à écrire un message !' : 'Aucun message pour cette session.'}
              </Text>
            </Animated.View>
          }
        />
        {isLive && (
          <View style={[styles.chatInputRow, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Écrire un message..."
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.chatInput, { backgroundColor: theme.colors.backgroundAlt, color: theme.colors.text }]}
              onSubmitEditing={sendMessage}
            />
            <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="send" size={17} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  videoArea: { height: 300, backgroundColor: '#000', overflow: 'hidden' },
  topBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8 },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  viewersBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  viewersText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 5 },
  centerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  centerIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  centerOverlayTitle: { color: '#fff', fontSize: 15.5, fontWeight: '700', textAlign: 'center', lineHeight: 21 },
  centerOverlayText: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, textAlign: 'center', marginTop: 6 },
  teacherRow: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center' },
  teacherName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  courseTag: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  infoBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  liveTitle: { flex: 1, fontSize: 15.5, fontWeight: '700', marginRight: 12 },
  reactionBtn: { flexDirection: 'row', alignItems: 'center' },
  reactionCount: { fontSize: 13, marginLeft: 5, fontWeight: '700' },
  endBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  endBtnText: { fontSize: 12.5, fontWeight: '700', marginLeft: 5 },
  heartLayer: { position: 'absolute', bottom: 24, right: 4, alignItems: 'center' },
  floatingHeart: { position: 'absolute', bottom: 0 },
  chatWrap: { flex: 1 },
  chatRow: { flexDirection: 'row', marginBottom: 15 },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatName: { fontSize: 13.5, fontWeight: '700' },
  chatTime: { fontSize: 11, marginLeft: 'auto' },
  chatMessage: { fontSize: 14, marginTop: 3, lineHeight: 19 },
  chatEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  chatEmptyText: { fontSize: 13, marginTop: 10, textAlign: 'center' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, height: 46, borderRadius: 23, paddingHorizontal: 17, fontSize: 14.5 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});
