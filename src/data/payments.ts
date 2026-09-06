import { Payment } from '../types';

export const payments: Payment[] = [
  { id: 'pay-1', courseId: 'course-1', courseTitle: 'Mathématiques Terminale Série C', studentId: 'student-1', studentName: 'Mariem Mint Abdellahi', amount: 2500, date: '2026-08-20', method: 'Bankily', status: 'Réussi' },
  { id: 'pay-2', courseId: 'course-1', courseTitle: 'Mathématiques Terminale Série C', studentId: 'student-4', studentName: 'Abdellahi Ould Bilal', amount: 2500, date: '2026-08-18', method: 'Masrvi', status: 'Réussi' },
  { id: 'pay-3', courseId: 'course-4', courseTitle: 'Mathématiques Brevet (BEPC)', studentId: 'student-5', studentName: 'Khadijetou Mint Ahmed', amount: 1500, date: '2026-08-15', method: 'Click', status: 'Réussi' },
  { id: 'pay-4', courseId: 'course-9', courseTitle: 'Histoire-Géographie — Bac & Brevet', studentId: 'student-1', studentName: 'Mariem Mint Abdellahi', amount: 1700, date: '2026-08-10', method: 'Bankily', status: 'Réussi' },
  { id: 'pay-5', courseId: 'course-1', courseTitle: 'Mathématiques Terminale Série C', studentId: 'student-6', studentName: 'Yahya Ould Sidi', amount: 2500, date: '2026-08-05', method: 'Sedad', status: 'En attente' },
  { id: 'pay-6', courseId: 'course-4', courseTitle: 'Mathématiques Brevet (BEPC)', studentId: 'student-7', studentName: 'Salka Mint Boubacar', amount: 1500, date: '2026-07-29', method: 'Masrvi', status: 'Réussi' },
  { id: 'pay-7', courseId: 'course-9', courseTitle: 'Histoire-Géographie — Bac & Brevet', studentId: 'student-8', studentName: 'Ahmed Salem Ould Vall', amount: 1700, date: '2026-07-20', method: 'Sedad', status: 'Échoué' },
];

export function getPaymentsByTeacherCourses(courseIds: string[]): Payment[] {
  return payments.filter((p) => courseIds.includes(p.courseId));
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Mars', amount: 168000 },
  { month: 'Avril', amount: 212000 },
  { month: 'Mai', amount: 192000 },
  { month: 'Juin', amount: 268000 },
  { month: 'Juillet', amount: 288000 },
  { month: 'Août', amount: 324000 },
];
