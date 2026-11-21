import { Category, Course, CourseLevel, CoursePdf, GradeTrack, Lesson, PublicTeacher, Review, SchoolSettings, SchoolTerm, Track } from '../types';
import { apiRequest } from './client';

export function fetchCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/courses/');
}

export function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories/');
}

export function fetchTracks(): Promise<Track[]> {
  return apiRequest<Track[]>('/tracks/', { auth: false });
}

export function fetchTerms(): Promise<SchoolTerm[]> {
  return apiRequest<SchoolTerm[]>('/terms/', { auth: false });
}

export function fetchTeachers(): Promise<PublicTeacher[]> {
  return apiRequest<PublicTeacher[]>('/teachers/');
}

export function fetchSettings(): Promise<SchoolSettings> {
  return apiRequest<SchoolSettings>('/settings/', { auth: false });
}

export function fetchCourseReviews(courseId: string): Promise<Review[]> {
  return apiRequest<Review[]>(`/courses/${courseId}/reviews/`);
}

export function createCourseReview(courseId: string, rating: number, comment: string): Promise<Review> {
  return apiRequest<Review>(`/courses/${courseId}/reviews/`, { method: 'POST', body: { rating, comment } });
}

export interface NewCoursePayload {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  price: number;
  level: CourseLevel;
  thumbnail: string;
  coverGradient?: readonly [string, string];
  gradeTracks?: GradeTrack[];
  term?: number;
  contentType?: Course['contentType'];
}

export function createCourse(payload: NewCoursePayload): Promise<Course> {
  return apiRequest<Course>('/courses/', { method: 'POST', body: payload });
}

export function updateCourseRequest(courseId: string, updates: Partial<Course>): Promise<Course> {
  return apiRequest<Course>(`/courses/${courseId}/`, { method: 'PATCH', body: updates });
}

export function deleteCourseRequest(courseId: string): Promise<void> {
  return apiRequest<void>(`/courses/${courseId}/`, { method: 'DELETE' });
}

export interface NewLessonPayload {
  title: string;
  durationMinutes: number;
  isPreview?: boolean;
  videoUrl?: string;
  thumbnail?: string;
  order?: number;
  pdfTitle?: string;
  pdfSizeMb?: number;
  pdfPages?: number;
  pdfUri?: string;
}

export function createLesson(courseId: string, payload: NewLessonPayload): Promise<Lesson> {
  return apiRequest<Lesson>(`/courses/${courseId}/lessons/`, { method: 'POST', body: payload });
}

export interface NewCoursePdfPayload {
  title: string;
  sizeMb: number;
  pages?: number;
  uri?: string;
  order?: number;
}

export function createCoursePdf(courseId: string, payload: NewCoursePdfPayload): Promise<CoursePdf> {
  return apiRequest<CoursePdf>(`/courses/${courseId}/pdfs/`, { method: 'POST', body: payload });
}

export function updateLesson(lessonId: string, updates: Partial<NewLessonPayload>): Promise<Lesson> {
  return apiRequest<Lesson>(`/lessons/${lessonId}/`, { method: 'PATCH', body: updates });
}

export function deleteLesson(lessonId: string): Promise<void> {
  return apiRequest<void>(`/lessons/${lessonId}/`, { method: 'DELETE' });
}
