export type UserRole = 'student' | 'teacher' | 'admin' | 'director';

export interface BaseUser {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
}

/** Slug of a class/filière (1af, brevet, bac-c…) — the list is managed by the director (see Track). */
export type GradeTrack = string;

export type SchoolLevel = 'primaire' | 'college' | 'lycee' | 'concours';

export interface Track {
  id: GradeTrack;
  label: string;
  shortLabel: string;
  code: string;
  level: SchoolLevel;
  order: number;
  mainCategoryIds: string[];
}

export interface SchoolTerm {
  number: number;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isStarted: boolean;
}

export interface SchoolSettings {
  whatsappNumber: string;
  merchantNumbers: Record<string, string>;
  defaultMaxViews: number;
  teacherOfferMaxViews: number;
}

export type OfferType = 'single' | 'full' | 'main' | 'secondary' | 'teacher';

export interface Student extends BaseUser {
  role: 'student';
  enrolledCourseIds: string[];
  favoriteCourseIds: string[];
  purchasedCourseIds: string[];
  gradeTrack: GradeTrack | '';
  favoriteTeacherIds: string[];
}

export interface Teacher extends BaseUser {
  role: 'teacher';
  headline: string;
  courseIds: string[];
  totalStudents: number;
  totalRevenue: number;
  rating: number;
  specialties: string[];
  teachingCategoryIds: string[];
  revenueShare: number;
  earnings: number;
  packsClosed: boolean;
  promoFreeUntil: string | null;
}

export interface StaffUser extends BaseUser {
  role: 'admin' | 'director';
}

export type AppUser = Student | Teacher | StaffUser;

/** What a student sees of a teacher (fenêtre des professeurs). */
export interface PublicTeacher {
  id: string;
  fullName: string;
  avatar: string;
  headline: string;
  bio: string;
  specialties: string[];
  courseCount: number;
  totalStudents: number;
  rating: number;
  teachingCategoryIds: string[];
  promoFreeUntil: string | null;
  isPromoActive: boolean;
}

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
  pdfTitle?: string;
  pdfSizeMb?: number;
  pdfPages?: number;
  pdfUri?: string;
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
  gradeTracks: GradeTrack[];
  language: string;
  durationHours: number;
  lastUpdated: string;
  lessons: Lesson[];
  pdfs: CoursePdf[];
  whatYouWillLearn: string[];
  requirements: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  teacherHeadline?: string;
  /** Trimestre 1, 2 ou 3 : le cours se débloque au début du trimestre. */
  term: number;
  contentType: 'video' | 'pdf' | 'both';
  isClosed: boolean;
  promoFreeUntil: string | null;
  isFree: boolean;
  isLocked: boolean;
  unlockDate: string | null;
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
  reference?: string;
  offer?: OfferType;
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
  reactionsCount: number;
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
