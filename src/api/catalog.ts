import { Category, Course, CourseLevel, Review } from '../types';
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
