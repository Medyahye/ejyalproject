import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface AvatarProps {
  uri: string;
  size?: number;
  ring?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, size = 44, ring = false }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 2.5 : 0,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: size / 2 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
