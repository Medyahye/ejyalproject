import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Course, GradeTrack, Payment } from '../types';
import { createCourse, deleteCourseRequest, updateCourseRequest } from '../api/catalog';
import { fetchPayments } from '../api/commerce';
import { computeMonthlyRevenue, MonthlyRevenue } from '../utils/analytics';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';

interface NewCoursePayload {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  level: Course['level'];
  thumbnail: string;
  gradeTracks: GradeTrack[];
}

interface TeacherDataContextValue {
  courses: Course[];
  myCourses: Course[];
  addCourse: (payload: NewCoursePayload) => Promise<Course>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  payments: Payment[];
  monthlyRevenue: MonthlyRevenue[];
}

const TeacherDataContext = createContext<TeacherDataContextValue | undefined>(undefined);

const GRADIENTS: Array<readonly [string, string]> = [
  ['#6C5CE7', '#4432B0'],
  ['#3D7FF7', '#2C63D6'],
  ['#FF6B6B', '#E64A4A'],
  ['#00B894', '#00785C'],
  ['#FDCB6E', '#E8A93C'],
];

export const TeacherDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { courses, refresh: refreshCatalog } = useCatalog();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments().then(setPayments).catch(() => setPayments([]));
  }, []);

  const myCourses = useMemo(() => {
    if (!user || user.role !== 'teacher') return [];
    return courses.filter((c) => c.teacherId === user.id);
  }, [courses, user]);

  const addCourse = useCallback(
    async (payload: NewCoursePayload) => {
      const created = await createCourse({
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        categoryId: payload.categoryId,
        price: payload.price,
        level: payload.level,
        thumbnail: payload.thumbnail || `https://picsum.photos/seed/${Date.now()}/600/400`,
        coverGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        gradeTracks: payload.gradeTracks,
      });
      await refreshCatalog();
      return created;
    },
    [refreshCatalog]
  );

  const updateCourse = useCallback(
    async (courseId: string, updates: Partial<Course>) => {
      await updateCourseRequest(courseId, updates);
      await refreshCatalog();
    },
    [refreshCatalog]
  );

  const deleteCourse = useCallback(
    async (courseId: string) => {
      await deleteCourseRequest(courseId);
      await refreshCatalog();
    },
    [refreshCatalog]
  );

  const monthlyRevenue = useMemo(() => computeMonthlyRevenue(payments), [payments]);

  const value = useMemo(
    () => ({ courses, myCourses, addCourse, updateCourse, deleteCourse, payments, monthlyRevenue }),
    [courses, myCourses, addCourse, updateCourse, deleteCourse, payments, monthlyRevenue]
  );

  return <TeacherDataContext.Provider value={value}>{children}</TeacherDataContext.Provider>;
};

export function useTeacherData(): TeacherDataContextValue {
  const ctx = useContext(TeacherDataContext);
  if (!ctx) throw new Error('useTeacherData must be used within a TeacherDataProvider');
  return ctx;
}
