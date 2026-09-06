export type UserRole = 'student' | 'teacher';

export interface BaseUser {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
}

export interface Student extends BaseUser {
  role: 'student';
  enrolledCourseIds: string[];
  favoriteCourseIds: string[];
  purchasedCourseIds: string[];
}

export interface Teacher extends BaseUser {
  role: 'teacher';
  headline: string;
  courseIds: string[];
  totalStudents: number;
  totalRevenue: number;
  rating: number;
  specialties: string[];
}

export type AppUser = Student | Teacher;

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  courseCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  isPreview: boolean;
  videoUrl: string;
  thumbnail: string;
}

export interface CoursePdf {
  id: string;
  title: string;
  sizeMb: number;
  pages: number;
  uri: string;
}

export interface Review {
  id: string;
  courseId: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export type CourseLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  coverGradient: readonly [string, string];
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  level: CourseLevel;
  language: string;
  durationHours: number;
  lastUpdated: string;
  lessons: Lesson[];
  pdfs: CoursePdf[];
  whatYouWillLearn: string[];
  requirements: string[];
  isFeatured: boolean;
  isBestseller: boolean;
}

export interface Payment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  method: 'Bankily' | 'Masrvi' | 'Sedad' | 'Click';
  status: 'Réussi' | 'En attente' | 'Échoué';
}

export type LiveStatus = 'upcoming' | 'live' | 'ended';

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  courseId?: string;
  categoryName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveStatus;
  viewersCount: number;
  thumbnail: string;
  coverGradient: readonly [string, string];
}

export interface LiveChatMessage {
  id: string;
  userName: string;
  avatar: string;
  message: string;
  isTeacher?: boolean;
  timestamp: string;
}

export interface CartItem {
  course: Course;
  addedAt: string;
}
