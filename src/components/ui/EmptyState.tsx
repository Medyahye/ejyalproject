import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'file-tray-outline', title, description, actionLabel, onAction }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <Animated.View entering={ZoomIn.delay(60).springify()} style={[styles.iconCircle, { backgroundColor: theme.colors.primarySoft }]}>
        <Ionicons name={icon} size={26} color={theme.colors.primary} />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(140).springify()} style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Animated.Text>
      {description && (
        <Animated.Text entering={FadeInDown.delay(180).springify()} style={[styles.desc, { color: theme.colors.textMuted }]}>
          {description}
        </Animated.Text>
      )}
      {actionLabel && onAction && (
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Button label={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: 18, paddingHorizontal: 24 }} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, paddingHorizontal: 32 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 15.5, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  desc: { fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
});
