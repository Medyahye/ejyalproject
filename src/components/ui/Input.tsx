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

export const Input: React.FC<InputProps> = ({ label, error, icon, isPassword, style, ...rest }) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.backgroundAlt,
            borderColor: error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        {icon && <Ionicons name={icon} size={19} color={focused ? theme.colors.primary : theme.colors.textMuted} style={{ marginRight: 10 }} />}
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }, style]}
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
  input: { flex: 1, fontSize: 15, height: '100%' },
  error: { fontSize: 12, marginTop: 4, fontWeight: '600' },
});
