import { AppUser, Course, OfferType, Payment, SchoolSettings, SchoolTerm, Track, UserRole } from '../types';
import { apiRequest } from './client';

export interface StaffOverview {
  students: number;
  teachers: number;
  closedTeachers: number;
  courses: number;
  closedCourses: number;
  activeEnrollments: number;
  revenue: number;
  pendingOrders: number;
  pendingAmount: number;
}

export interface StaffOrder {
  reference: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  method: Payment['method'];
  status: Payment['status'];
  offer: OfferType;
  date: string;
  amount: number;
  courses: Array<{ id: string; title: string; amount: number }>;
}

export interface StaffTeacher {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  headline: string;
  revenueShare: number;
  packsClosed: boolean;
  promoFreeUntil: string | null;
  courseCount: number;
  subscribers: number;
  revenue: number;
}

export const fetchOverview = () => apiRequest<StaffOverview>('/staff/overview/');

export const fetchOrders = (status?: Payment['status']) =>
  apiRequest<StaffOrder[]>(`/staff/orders/${status ? `?status=${encodeURIComponent(status)}` : ''}`);

export const decideOrder = (reference: string, decision: 'validate' | 'reject') =>
  apiRequest<{ reference: string; status: Payment['status'] }>(`/staff/orders/${encodeURIComponent(reference)}/${decision}/`, {
    method: 'POST',
  });

export const fetchStaffTeachers = () => apiRequest<StaffTeacher[]>('/staff/teachers/');

export const updateStaffTeacher = (id: string, updates: Partial<Pick<StaffTeacher, 'revenueShare' | 'packsClosed' | 'promoFreeUntil'>>) =>
  apiRequest<StaffTeacher>(`/staff/teachers/${id}/`, { method: 'PATCH', body: updates });

export const fetchStaffCourses = () => apiRequest<Course[]>('/staff/courses/');

export const updateStaffCourse = (id: string, updates: Partial<Pick<Course, 'isClosed' | 'promoFreeUntil' | 'term'>>) =>
  apiRequest<Course>(`/staff/courses/${id}/`, { method: 'PATCH', body: updates });

export interface NewAccountPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  gradeTrack?: string;
  headline?: string;
  revenueShare?: number;
}

export const fetchAccounts = (role?: UserRole) => apiRequest<AppUser[]>(`/staff/users/${role ? `?role=${role}` : ''}`);

export const createAccount = (payload: NewAccountPayload) =>
  apiRequest<AppUser>('/staff/users/', { method: 'POST', body: payload });

export const createTrack = (track: Omit<Track, 'order'> & { order?: number }) =>
  apiRequest<Track>('/staff/tracks/', { method: 'POST', body: track });

export const updateTrack = (id: string, updates: Partial<Track>) =>
  apiRequest<Track>(`/staff/tracks/${id}/`, { method: 'PATCH', body: updates });

export const deleteTrack = (id: string) => apiRequest<void>(`/staff/tracks/${id}/`, { method: 'DELETE' });

export const updateTerm = (number: number, updates: Partial<Pick<SchoolTerm, 'label' | 'startDate' | 'endDate'>>) =>
  apiRequest<SchoolTerm>(`/staff/terms/${number}/`, { method: 'PATCH', body: updates });

export const updateSettings = (updates: Partial<SchoolSettings>) =>
  apiRequest<SchoolSettings>('/staff/settings/', { method: 'PATCH', body: updates });
