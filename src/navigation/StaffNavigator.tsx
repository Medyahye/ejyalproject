import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { StaffHomeScreen } from '../screens/staff/StaffHomeScreen';
import { StaffOrdersScreen } from '../screens/staff/StaffOrdersScreen';
import { StaffTeachersScreen } from '../screens/staff/StaffTeachersScreen';
import { StaffCoursesScreen } from '../screens/staff/StaffCoursesScreen';
import { DirectorScreen } from '../screens/staff/DirectorScreen';

export type StaffTabParamList = {
  StaffHome: undefined;
  StaffOrders: undefined;
  StaffTeachers: undefined;
  StaffCourses: undefined;
  Director: undefined;
};

const Tab = createBottomTabNavigator<StaffTabParamList>();

const ICONS: Record<keyof StaffTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  StaffHome: ['grid', 'grid-outline'],
  StaffOrders: ['cash', 'cash-outline'],
  StaffTeachers: ['easel', 'easel-outline'],
  StaffCourses: ['albums', 'albums-outline'],
  Director: ['diamond', 'diamond-outline'],
};

/** Back-office for admins and the director. */
export const StaffNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDirector = user?.role === 'director';
  const labels: Record<keyof StaffTabParamList, string> = {
    StaffHome: 'Accueil',
    StaffOrders: 'Paiements',
    StaffTeachers: 'Profs',
    StaffCourses: 'Cours',
    Director: isDirector ? 'Direction' : 'Compte',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: isDirector ? '#4432B0' : theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700' },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ focused, color, size }) => {
          const name = route.name === 'Director' && !isDirector ? (focused ? 'person-circle' : 'person-circle-outline') : ICONS[route.name][focused ? 0 : 1];
          return <Ionicons name={name} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="StaffHome" component={StaffHomeScreen} />
      <Tab.Screen name="StaffOrders" component={StaffOrdersScreen} />
      <Tab.Screen name="StaffTeachers" component={StaffTeachersScreen} />
      <Tab.Screen name="StaffCourses" component={StaffCoursesScreen} />
      <Tab.Screen name="Director" component={DirectorScreen} />
    </Tab.Navigator>
  );
};
