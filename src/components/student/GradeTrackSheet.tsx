import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { GradeTrack, Track } from '../../types';
import { IconButton } from '../ui';
import { ClassPicker } from './ClassPicker';

interface GradeTrackSheetProps {
  visible: boolean;
  tracks: Track[];
  currentTrack?: GradeTrack | '';
  onSelect: (track: GradeTrack) => void;
  onClose: () => void;
}

export const GradeTrackSheet: React.FC<GradeTrackSheetProps> = ({ visible, tracks, currentTrack, onSelect, onClose }) => {
  const { theme } = useTheme();
  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(250)} style={StyleSheet.absoluteFill}>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </Animated.View>
      <Animated.View entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))} style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Ta classe</Text>
          </View>
          <IconButton icon="close" onPress={onClose} variant="ghost" size={34} />
        </View>
        <ClassPicker tracks={tracks} value={currentTrack} onChange={onSelect} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', zIndex: 50 } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 3 },
});
