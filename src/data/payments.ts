import { Payment } from '../types';

export const payments: Payment[] = [
  { id: 'pay-1', courseId: 'course-1', courseTitle: 'React Native de Zéro à Expert', studentId: 'student-1', studentName: 'Yasmine El Amrani', amount: 59.99, date: '2026-08-20', method: 'Carte bancaire', status: 'Réussi' },
  { id: 'pay-2', courseId: 'course-1', courseTitle: 'React Native de Zéro à Expert', studentId: 'student-4', studentName: 'Julien Marchand', amount: 59.99, date: '2026-08-18', method: 'PayPal', status: 'Réussi' },
  { id: 'pay-3', courseId: 'course-4', courseTitle: 'Node.js & APIs REST Avancées', studentId: 'student-5', studentName: 'Camille Dubois', amount: 64.99, date: '2026-08-15', method: 'Carte bancaire', status: 'Réussi' },
  { id: 'pay-4', courseId: 'course-9', courseTitle: 'TypeScript pour Développeurs React', studentId: 'student-1', studentName: 'Yasmine El Amrani', amount: 34.99, date: '2026-08-10', method: 'Mobile Money', status: 'Réussi' },
  { id: 'pay-5', courseId: 'course-1', courseTitle: 'React Native de Zéro à Expert', studentId: 'student-6', studentName: 'Hugo Lefevre', amount: 59.99, date: '2026-08-05', method: 'Carte bancaire', status: 'En attente' },
  { id: 'pay-6', courseId: 'course-4', courseTitle: 'Node.js & APIs REST Avancées', studentId: 'student-7', studentName: 'Nadia Bouzid', amount: 64.99, date: '2026-07-29', method: 'PayPal', status: 'Réussi' },
  { id: 'pay-7', courseId: 'course-9', courseTitle: 'TypeScript pour Développeurs React', studentId: 'student-8', studentName: 'Marc Rousseau', amount: 34.99, date: '2026-07-20', method: 'Carte bancaire', status: 'Échoué' },
];

export function getPaymentsByTeacherCourses(courseIds: string[]): Payment[] {
  return payments.filter((p) => courseIds.includes(p.courseId));
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Mars', amount: 4200 },
  { month: 'Avril', amount: 5300 },
  { month: 'Mai', amount: 4800 },
  { month: 'Juin', amount: 6700 },
  { month: 'Juillet', amount: 7200 },
  { month: 'Août', amount: 8100 },
];
