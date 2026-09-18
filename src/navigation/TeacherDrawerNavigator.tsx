import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TeacherDrawerParamList } from './types';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Teacher } from '../types';
import { DashboardScreen } from '../screens/teacher/DashboardScreen';
import { TeacherMyCoursesScreen } from '../screens/teacher/TeacherMyCoursesScreen';
import { StatisticsScreen } from '../screens/teacher/StatisticsScreen';
import { RevenueScreen } from '../screens/teacher/RevenueScreen';
import { EnrolledStudentsScreen } from '../screens/teacher/EnrolledStudentsScreen';
import { TeacherProfileScreen } from '../screens/teacher/TeacherProfileScreen';
import { TeacherLiveScreen } from '../screens/live/TeacherLiveScreen';

const Drawer = createDrawerNavigator<TeacherDrawerParamList>();

const menuItems: Array<{ route: keyof TeacherDrawerParamList; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { route: 'Dashboard', label: 'Tableau de bord', icon: 'grid-outline' },
  { route: 'TeacherMyCourses', label: 'Mes packages', icon: 'book-outline' },
  { route: 'Statistics', label: 'Statistiques', icon: 'stats-chart-outline' },
  { route: 'Revenue', label: 'Revenus', icon: 'cash-outline' },
  { route: 'EnrolledStudents', label: 'Étudiants inscrits', icon: 'people-outline' },
  { route: 'TeacherLive', label: 'Sessions Live', icon: 'radio-outline' },
  { route: 'TeacherProfile', label: 'Profil', icon: 'person-outline' },
];

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const teacher = user as Teacher;
  const activeRoute = props.state.routeNames[props.state.index];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <Avatar uri={teacher?.avatar} size={72} ring />
        <Text style={styles.name}>{teacher?.fullName}</Text>
        <Text style={styles.headline} numberOfLines={2}>
          {teacher?.headline}
        </Text>
      </LinearGradient>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 12 }}>
        {menuItems.map((item) => {
          const focused = activeRoute === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => props.navigation.navigate(item.route)}
              style={[
                styles.menuItem,
                { backgroundColor: focused ? theme.colors.primarySoft : 'transparent' },
              ]}
            >
              <Ionicons name={item.icon} size={23} color={focused ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.menuLabel, { color: focused ? theme.colors.primary : theme.colors.text }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </DrawerContentScrollView>
      <Pressable onPress={logout} style={[styles.logout, { borderTopColor: theme.colors.border }]}>
        <Ionicons name="log-out-outline" size={23} color={theme.colors.danger} />
        <Text style={[styles.menuLabel, { color: theme.colors.danger }]}>Déconnexion</Text>
      </Pressable>
    </View>
  );
};

export const TeacherDrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerType: 'front', overlayColor: 'rgba(14,14,19,0.5)' }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="TeacherMyCourses" component={TeacherMyCoursesScreen} />
      <Drawer.Screen name="Statistics" component={StatisticsScreen} />
      <Drawer.Screen name="Revenue" component={RevenueScreen} />
      <Drawer.Screen name="EnrolledStudents" component={EnrolledStudentsScreen} />
      <Drawer.Screen name="TeacherLive" component={TeacherLiveScreen} />
      <Drawer.Screen name="TeacherProfile" component={TeacherProfileScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 26, paddingHorizontal: 20, borderBottomRightRadius: 28 },
  name: { fontSize: 19, fontWeight: '800', color: '#fff', marginTop: 13 },
  headline: { fontSize: 13.5, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 19 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, marginHorizontal: 12, borderRadius: 12, marginBottom: 2 },
  menuLabel: { fontSize: 15.5, fontWeight: '700', marginLeft: 15 },
  logout: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 32, borderTopWidth: 1 },
});
