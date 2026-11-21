import { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { OfferType } from '../types';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type StudentTabParamList = {
  Home: undefined;
  Explore: undefined;
  MyCourses: undefined;
  Live: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabParamList>;
  Search: undefined;
  TrackSubjects: { track: string };
  CategoryCourses: { track: string; categoryId: string; categoryName: string };
  CourseDetail: { courseId: string };
  VideoPlayer: { courseId: string; lessonId?: string };
  PdfLibrary: { courseId: string };
  PdfViewer: { courseId: string; lessonId?: string; uri: string; title: string };
  Favorites: undefined;
  Cart: undefined;
  /** Without params the cart is paid; with params a pack offer (its courses) is paid. */
  Payment: { offer?: OfferType; courseIds?: string[]; title?: string } | undefined;
  Teachers: undefined;
  TeacherProfile: { teacherId: string };
  Offer: { offer: OfferType; teacherId?: string };
  Settings: undefined;
  LiveRoom: { liveId: string };
};

export type TeacherDrawerParamList = {
  Dashboard: undefined;
  TeacherMyCourses: undefined;
  Statistics: undefined;
  Revenue: undefined;
  EnrolledStudents: undefined;
  TeacherLive: undefined;
  TeacherProfile: undefined;
};

export type TeacherStackParamList = {
  TeacherDrawerRoot: NavigatorScreenParams<TeacherDrawerParamList>;
  AddCourse: undefined;
  EditCourse: { courseId: string };
  TeacherCourseDetail: { courseId: string };
  ScheduleLive: undefined;
  LiveRoom: { liveId: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  StudentRoot: NavigatorScreenParams<StudentStackParamList>;
  TeacherRoot: NavigatorScreenParams<TeacherStackParamList>;
};

export type StudentTabScreenProps<T extends keyof StudentTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<StudentTabParamList, T>,
  NativeStackScreenProps<StudentStackParamList>
>;

export type StudentStackScreenProps<T extends keyof StudentStackParamList> = NativeStackScreenProps<StudentStackParamList, T>;

export type TeacherDrawerScreenProps<T extends keyof TeacherDrawerParamList> = CompositeScreenProps<
  DrawerScreenProps<TeacherDrawerParamList, T>,
  NativeStackScreenProps<TeacherStackParamList>
>;

export type TeacherStackScreenProps<T extends keyof TeacherStackParamList> = NativeStackScreenProps<TeacherStackParamList, T>;
