import { CartItem, Course, Payment } from '../types';
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
}

export function checkoutCartRequest(method: Payment['method']): Promise<EnrollmentEntry[]> {
  return apiRequest<EnrollmentEntry[]>('/cart/checkout/', { method: 'POST', body: { method } });
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
