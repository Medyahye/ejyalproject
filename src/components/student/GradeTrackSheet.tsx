import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { GradeTrack } from '../../types';
import { GRADE_TRACKS } from '../../constants/gradeTracks';
import { IconButton } from '../ui';

interface GradeTrackSheetProps {
  visible: boolean;
  currentTrack?: GradeTrack | '';
  onSelect: (track: GradeTrack) => void;
  onClose: () => void;
}

export const GradeTrackSheet: React.FC<GradeTrackSheetProps> = ({ visible, currentTrack, onSelect, onClose }) => {
  const { theme } = useTheme();
  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Quelle est ta filière ?</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>On personnalise tes recommandations</Text>
          </View>
          <IconButton icon="close" onPress={onClose} variant="ghost" size={34} />
        </View>

        <View style={styles.grid}>
          {GRADE_TRACKS.map((track) => {
            const selected = currentTrack === track.id;
            return (
              <Pressable
                key={track.id}
                onPress={() => onSelect(track.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.card,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.cardIcon,
                    { backgroundColor: selected ? 'rgba(255,255,255,0.2)' : theme.colors.primarySoft },
                  ]}
                >
                  <Ionicons name={track.icon} size={22} color={selected ? '#fff' : theme.colors.primary} />
                </View>
                <Text style={[styles.cardLabel, { color: selected ? '#fff' : theme.colors.text }]}>{track.shortLabel}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 12.5, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 16, borderWidth: 1.5, padding: 16, alignItems: 'flex-start' },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLabel: { fontSize: 13.5, fontWeight: '700' },
});
