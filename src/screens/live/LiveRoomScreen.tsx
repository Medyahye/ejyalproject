import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { Avatar, Badge } from '../../components/ui';
import { useLive } from '../../context/LiveContext';
import { fetchLiveChat, postLiveChatMessage } from '../../api/live';
import { LiveChatMessage } from '../../types';

type RoomRoute = RouteProp<{ LiveRoom: { liveId: string } }, 'LiveRoom'>;

export const LiveRoomScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<RoomRoute>();
  const navigation = useNavigation();
  const { liveSessions } = useLive();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [reactions, setReactions] = useState(0);

  const live = liveSessions.find((l) => l.id === route.params.liveId) ?? liveSessions[0];
  const isLive = live?.status === 'live';

  useEffect(() => {
    if (!live) return;
    fetchLiveChat(live.id).then(setMessages).catch(() => setMessages([]));
  }, [live?.id]);

  if (!live) return null;

  const sendMessage = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    postLiveChatMessage(live.id, text)
      .then((sent) => setMessages((prev) => [...prev, sent]))
      .catch(() => {});
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0E0E13' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.videoArea}>
        <Image source={{ uri: live.thumbnail }} style={StyleSheet.absoluteFill} blurRadius={isLive ? 0 : 3} />
        <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />

        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="chevron-down" size={26} color="#fff" />
          </Pressable>
          <View style={styles.topBarRight}>
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>EN DIRECT</Text>
              </View>
            )}
            <View style={styles.viewersBadge}>
              <Ionicons name="eye" size={12} color="#fff" />
              <Text style={styles.viewersText}>{live.viewersCount}</Text>
            </View>
          </View>
        </View>

        {!isLive && (
          <View style={styles.centerOverlay}>
            <Ionicons name="time-outline" size={40} color="#fff" />
            <Text style={styles.centerOverlayText}>
              {live.status === 'upcoming' ? 'Cette session n\'a pas encore commencé' : 'Cette session est terminée — replay bientôt disponible'}
            </Text>
          </View>
        )}

        <View style={styles.teacherRow}>
          <Avatar uri={live.teacherAvatar} size={36} ring />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.teacherName}>{live.teacherName}</Text>
            <Text style={styles.courseTag}>{live.categoryName}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text numberOfLines={1} style={[styles.liveTitle, { color: theme.colors.text }]}>{live.title}</Text>
        <Pressable onPress={() => setReactions((r) => r + 1)} style={styles.reactionBtn}>
          <Ionicons name="heart" size={16} color={theme.colors.danger} />
          <Text style={[styles.reactionCount, { color: theme.colors.textSecondary }]}>{reactions}</Text>
        </Pressable>
      </View>

      <View style={[styles.chatWrap, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <View style={styles.chatRow}>
              <Avatar uri={item.avatar} size={26} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <View style={styles.chatNameRow}>
                  <Text style={[styles.chatName, { color: item.isTeacher ? theme.colors.primary : theme.colors.text }]}>{item.userName}</Text>
                  {item.isTeacher && <Badge label="Formateur" tone="primary" small />}
                  <Text style={[styles.chatTime, { color: theme.colors.textMuted }]}>{item.timestamp}</Text>
                </View>
                <Text style={[styles.chatMessage, { color: theme.colors.textSecondary }]}>{item.message}</Text>
              </View>
            </View>
          )}
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
              <Ionicons name="send" size={16} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  videoArea: { height: 280, backgroundColor: '#000' },
  topBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginRight: 4 },
  liveBadgeText: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
  viewersBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  viewersText: { color: '#fff', fontSize: 10.5, fontWeight: '700', marginLeft: 4 },
  centerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  centerOverlayText: { color: '#fff', fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 19 },
  teacherRow: { position: 'absolute', bottom: 14, left: 14, flexDirection: 'row', alignItems: 'center' },
  teacherName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  courseTag: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  infoBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1 },
  liveTitle: { flex: 1, fontSize: 14.5, fontWeight: '700', marginRight: 12 },
  reactionBtn: { flexDirection: 'row', alignItems: 'center' },
  reactionCount: { fontSize: 12, marginLeft: 4, fontWeight: '700' },
  chatWrap: { flex: 1 },
  chatRow: { flexDirection: 'row', marginBottom: 14 },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatName: { fontSize: 12.5, fontWeight: '700' },
  chatTime: { fontSize: 10, marginLeft: 'auto' },
  chatMessage: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, height: 42, borderRadius: 21, paddingHorizontal: 16, fontSize: 13.5 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});
