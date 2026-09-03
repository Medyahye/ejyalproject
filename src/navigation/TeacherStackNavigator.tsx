import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeacherStackParamList } from './types';
import { TeacherDrawerNavigator } from './TeacherDrawerNavigator';
import { AddCourseScreen } from '../screens/teacher/AddCourseScreen';
import { EditCourseScreen } from '../screens/teacher/EditCourseScreen';
import { CourseDetailScreen } from '../screens/student/CourseDetailScreen';
import { ScheduleLiveScreen } from '../screens/live/ScheduleLiveScreen';
import { LiveRoomScreen } from '../screens/live/LiveRoomScreen';

const Stack = createNativeStackNavigator<TeacherStackParamList>();

export const TeacherStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="TeacherDrawerRoot" component={TeacherDrawerNavigator} />
      <Stack.Screen name="AddCourse" component={AddCourseScreen} />
      <Stack.Screen name="EditCourse" component={EditCourseScreen} />
      <Stack.Screen name="TeacherCourseDetail" component={CourseDetailScreen as any} />
      <Stack.Screen name="ScheduleLive" component={ScheduleLiveScreen} />
      <Stack.Screen name="LiveRoom" component={LiveRoomScreen} options={{ animation: 'fade' }} />
    </Stack.Navigator>
  );
};
