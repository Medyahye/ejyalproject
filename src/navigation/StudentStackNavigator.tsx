import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentStackParamList } from './types';
import { StudentTabNavigator } from './StudentTabNavigator';
import { SearchScreen } from '../screens/student/SearchScreen';
import { TrackSubjectsScreen } from '../screens/student/TrackSubjectsScreen';
import { CategoryCoursesScreen } from '../screens/student/CategoryCoursesScreen';
import { CourseDetailScreen } from '../screens/student/CourseDetailScreen';
import { VideoPlayerScreen } from '../screens/student/VideoPlayerScreen';
import { PdfLibraryScreen } from '../screens/student/PdfLibraryScreen';
import { FavoritesScreen } from '../screens/student/FavoritesScreen';
import { CartScreen } from '../screens/student/CartScreen';
import { PaymentScreen } from '../screens/student/PaymentScreen';
import { SettingsScreen } from '../screens/student/SettingsScreen';
import { LiveRoomScreen } from '../screens/live/LiveRoomScreen';

const Stack = createNativeStackNavigator<StudentStackParamList>();

export const StudentStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="TrackSubjects" component={TrackSubjectsScreen} />
      <Stack.Screen name="CategoryCourses" component={CategoryCoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="PdfLibrary" component={PdfLibraryScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LiveRoom" component={LiveRoomScreen} options={{ animation: 'fade' }} />
    </Stack.Navigator>
  );
};
