import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface PinInputProps {
  length?: number;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({ length = 4, value, onChangeText, secure = true }) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length;
        const isActive = focused && i === value.length;
        return (
          <View
            key={i}
            style={[
              styles.box,
              {
                backgroundColor: theme.colors.backgroundAlt,
                borderColor: isActive ? theme.colors.primary : filled ? theme.colors.borderStrong : theme.colors.border,
                borderWidth: isActive ? 2 : 1.5,
              },
            ]}
          >
            {filled && (
              secure ? (
                <View style={[styles.dot, { backgroundColor: theme.colors.text }]} />
              ) : (
                <Text style={[styles.digit, { color: theme.colors.text }]}>{value[i]}</Text>
              )
            )}
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChangeText(v.replace(/[^0-9]/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  box: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  digit: { fontSize: 20, fontWeight: '700' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
