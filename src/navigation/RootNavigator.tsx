import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { StudentStackNavigator } from './StudentStackNavigator';
import { TeacherStackNavigator } from './TeacherStackNavigator';
import { StudentDataProvider } from '../context/StudentDataContext';
import { TeacherDataProvider } from '../context/TeacherDataContext';

export const RootNavigator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const navTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'teacher' ? (
        <TeacherDataProvider>
          <TeacherStackNavigator />
        </TeacherDataProvider>
      ) : (
        <StudentDataProvider>
          <StudentStackNavigator />
        </StudentDataProvider>
      )}
    </NavigationContainer>
  );
};
