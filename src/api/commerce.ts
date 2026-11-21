import { CartItem, Course, OfferType, Payment } from '../types';
import { apiRequest } from './client';

export interface FavoriteEntry {
  id: string;
  course: Course;
  created_at: string;
}

export function fetchFavorites(): Promise<FavoriteEntry[]> {
  return apiRequest<FavoriteEntry[]>('/favorites/');
}

export function addFavoriteRequest(courseId: string): Promise<FavoriteEntry> {
  return apiRequest<FavoriteEntry>('/favorites/', { method: 'POST', body: { courseId } });
}

export function removeFavoriteRequest(courseId: string): Promise<void> {
  return apiRequest<void>(`/favorites/by-course/${courseId}/`, { method: 'DELETE' });
}

export function fetchCart(): Promise<CartItem[]> {
  return apiRequest<CartItem[]>('/cart/');
}

export function addToCartRequest(courseId: string): Promise<CartItem> {
  return apiRequest<CartItem>('/cart/', { method: 'POST', body: { courseId } });
}

export function removeFromCartRequest(courseId: string): Promise<void> {
  return apiRequest<void>(`/cart/by-course/${courseId}/`, { method: 'DELETE' });
}

export interface EnrollmentEntry {
  id: string;
  courseId: string;
  course: Course;
  progress: number;
  purchasedAt: string;
  status: 'pending' | 'active';
  offer: OfferType;
  maxViews: number;
  /** lessonId → number of times the student already watched it */
  lessonViews: Record<string, number>;
}

export interface OrderResult {
  reference: string;
  offer: OfferType;
  method: Payment['method'];
  amount: number;
  status: 'pending' | 'active';
  whatsappNumber: string;
  grantedCourseIds: string[];
  pendingCourseIds: string[];
}

/** Without courseIds the cart is ordered; with courseIds (a pack offer) only those courses. */
export function checkoutRequest(method: Payment['method'], offer: OfferType = 'single', courseIds?: string[]): Promise<OrderResult> {
  return apiRequest<OrderResult>('/cart/checkout/', { method: 'POST', body: { method, offer, courseIds } });
}

export interface LessonViewResult {
  viewsUsed: number;
  maxViews: number | null;
  remaining: number | null;
}

export function recordLessonView(lessonId: string): Promise<LessonViewResult> {
  return apiRequest<LessonViewResult>(`/lessons/${lessonId}/view/`, { method: 'POST' });
}

export function fetchFavoriteTeachers(): Promise<Array<{ id: string; teacherId: string }>> {
  return apiRequest('/favorite-teachers/');
}

export function addFavoriteTeacherRequest(teacherId: string): Promise<unknown> {
  return apiRequest('/favorite-teachers/', { method: 'POST', body: { teacherId } });
}

export function removeFavoriteTeacherRequest(teacherId: string): Promise<void> {
  return apiRequest<void>(`/favorite-teachers/by-teacher/${teacherId}/`, { method: 'DELETE' });
}

export function fetchEnrollments(): Promise<EnrollmentEntry[]> {
  return apiRequest<EnrollmentEntry[]>('/enrollments/');
}

export function updateEnrollmentProgressRequest(enrollmentId: string, progress: number): Promise<EnrollmentEntry> {
  return apiRequest<EnrollmentEntry>(`/enrollments/${enrollmentId}/progress/`, { method: 'PATCH', body: { progress } });
}

export function fetchPayments(): Promise<Payment[]> {
  return apiRequest<Payment[]>('/payments/');
}
