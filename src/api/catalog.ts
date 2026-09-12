import { Category, Course, CourseLevel, CoursePdf, Lesson, Review } from '../types';
import { apiRequest } from './client';

export function fetchCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/courses/');
}

export function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories/');
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
