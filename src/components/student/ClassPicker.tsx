import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { GradeTrack, SchoolLevel, Track } from '../../types';
import { LEVELS, tracksForLevel } from '../../constants/levels';
import { haptics } from '../../utils/haptics';

interface ClassPickerProps {
  tracks: Track[];
  value?: GradeTrack | '';
  onChange: (track: GradeTrack) => void;
}

/** Two-step picker: school level (Primaire, Collège, Lycée, Concours) then the class itself. */
export const ClassPicker: React.FC<ClassPickerProps> = ({ tracks, value, onChange }) => {
  const { theme } = useTheme();
  const selectedTrack = tracks.find((t) => t.id === value);
  const [level, setLevel] = useState<SchoolLevel>(selectedTrack?.level ?? 'lycee');

  useEffect(() => {
    if (selectedTrack) setLevel(selectedTrack.level);
  }, [selectedTrack?.level]);

  const levelInfo = LEVELS.find((l) => l.id === level)!;
  const classes = tracksForLevel(tracks, level);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
        {LEVELS.map((l) => {
          const active = l.id === level;
          return (
            <Pressable
              key={l.id}
              onPress={() => {
                haptics.select();
                setLevel(l.id);
              }}
              style={[
                styles.levelChip,
                { backgroundColor: active ? l.gradient[0] : theme.colors.card, borderColor: active ? l.gradient[0] : theme.colors.border },
              ]}
            >
              <Ionicons name={l.icon} size={16} color={active ? '#fff' : theme.colors.textSecondary} />
              <Text style={[styles.levelChipText, { color: active ? '#fff' : theme.colors.text }]}>{l.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Animated.View key={level} entering={FadeIn.duration(200)} style={styles.grid}>
        {classes.map((track, i) => {
          const selected = track.id === value;
          return (
            <Animated.View key={track.id} entering={FadeIn.delay(i * 20).duration(200)} style={styles.cell}>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  onChange(track.id);
                }}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              >
                {selected ? (
                  <LinearGradient colors={levelInfo.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
                    <View style={styles.check}>
                      <Ionicons name="checkmark" size={10} color={levelInfo.gradient[1]} />
                    </View>
                    <Text style={[styles.code, { color: '#fff' }]}>{track.code}</Text>
                    <Text numberOfLines={1} style={[styles.label, { color: 'rgba(255,255,255,0.92)' }]}>{track.shortLabel}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.tile, { backgroundColor: theme.colors.card, borderWidth: 1.5, borderColor: theme.colors.border }]}>
                    <Text style={[styles.code, { color: levelInfo.gradient[1] }]}>{track.code}</Text>
                    <Text numberOfLines={1} style={[styles.label, { color: theme.colors.textSecondary }]}>{track.shortLabel}</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  levelChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5 },
  levelChipText: { fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '25%', padding: 4 },
  tile: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 8, height: 60, justifyContent: 'center', alignItems: 'center' },
  check: { position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  code: { fontSize: 17, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '600', lineHeight: 12, textAlign: 'center', marginTop: 2 },
});
