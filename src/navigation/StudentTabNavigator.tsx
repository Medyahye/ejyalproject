import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { StudentTabParamList } from './types';
import { useTheme } from '../theme';
import { HomeScreen } from '../screens/student/HomeScreen';
import { CourseListScreen } from '../screens/student/CourseListScreen';
import { MyCoursesScreen } from '../screens/student/MyCoursesScreen';
import { LiveListScreen } from '../screens/live/LiveListScreen';
import { ProfileScreen } from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const icons: Record<keyof StudentTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Explore: { active: 'compass', inactive: 'compass-outline' },
  MyCourses: { active: 'play-circle', inactive: 'play-circle-outline' },
  Live: { active: 'radio', inactive: 'radio-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

const labels: Record<keyof StudentTabParamList, string> = {
  Home: 'Accueil',
  Explore: 'Explorer',
  MyCourses: 'Mes cours',
  Live: 'Live',
  Profile: 'Profil',
};

export const StudentTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const name = route.name as keyof StudentTabParamList;
          return (
            <View>
              <Ionicons name={focused ? icons[name].active : icons[name].inactive} size={size - 2} color={color} />
            </View>
          );
        },
        tabBarLabel: labels[route.name as keyof StudentTabParamList],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={CourseListScreen} />
      <Tab.Screen name="MyCourses" component={MyCoursesScreen} />
      <Tab.Screen name="Live" component={LiveListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: { borderTopWidth: 1, elevation: 0 },
  tabLabel: { fontSize: 10.5, fontWeight: '700' },
});
