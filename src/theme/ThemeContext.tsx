import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors } from './colors';
import { spacing, radius, shadow, ShadowLevel } from './spacing';
import { typography } from './typography';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: (level: ShadowLevel) => object;
  isDark: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = '@educonnect/theme-preference';

function buildTheme(isDark: boolean): Theme {
  const colors = isDark ? darkColors : lightColors;
  return {
    colors,
    spacing,
    radius,
    typography,
    shadow: (level: ShadowLevel) => shadow(level, colors.shadow),
    isDark,
  };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'dark') setIsDark(true);
      if (stored === 'light') setIsDark(false);
    });
  }, []);

  const setDark = useCallback((value: boolean) => {
    setIsDark(value);
    AsyncStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light').catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(isDark), [isDark]);

  const value = useMemo(() => ({ theme, isDark, toggleTheme, setDark }), [theme, isDark, toggleTheme, setDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
