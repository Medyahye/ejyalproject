import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, isPassword, multiline, style, ...rest }) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  const activeShadow = focused && !error;
  const shadowStyle = theme.shadow('sm') as {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          {
            backgroundColor: theme.colors.backgroundAlt,
            borderColor: error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.radius.md,
          },
          shadowStyle,
          { shadowOpacity: activeShadow ? shadowStyle.shadowOpacity : 0, elevation: activeShadow ? shadowStyle.elevation : 0 },
        ]}
      >
        {icon && <Ionicons name={icon} size={19} color={focused ? theme.colors.primary : theme.colors.textMuted} style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }} />}
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, { color: theme.colors.text }, style]}
          multiline={multiline}
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {isPassword && (
          <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
            <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={19} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, height: '100%' },
  inputMultiline: { height: undefined, textAlignVertical: 'top' },
  error: { fontSize: 12, marginTop: 4, fontWeight: '600' },
});
