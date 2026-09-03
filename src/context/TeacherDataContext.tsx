import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Course } from '../types';
import { courses as mockCourses } from '../data/courses';
import { useAuth } from './AuthContext';

interface NewCoursePayload {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  level: Course['level'];
  thumbnail: string;
}

interface TeacherDataContextValue {
  courses: Course[];
  myCourses: Course[];
  addCourse: (payload: NewCoursePayload) => Course;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
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
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  const myCourses = useMemo(() => {
    if (!user || user.role !== 'teacher') return [];
    return courses.filter((c) => c.teacherId === user.id);
  }, [courses, user]);

  const addCourse = useCallback(
    (payload: NewCoursePayload) => {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        thumbnail: payload.thumbnail || `https://picsum.photos/seed/${Date.now()}/600/400`,
        coverGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        teacherId: user?.id ?? 'teacher-1',
        teacherName: user?.fullName ?? 'Vous',
        teacherAvatar: user?.avatar ?? '',
        categoryId: payload.categoryId,
        categoryName: payload.categoryName,
        price: payload.price,
        rating: 0,
        ratingCount: 0,
        studentsCount: 0,
        level: payload.level,
        language: 'Français',
        durationHours: 0,
        lastUpdated: new Date().toISOString().slice(0, 10),
        lessons: [],
        pdfs: [],
        whatYouWillLearn: [],
        requirements: [],
        isFeatured: false,
        isBestseller: false,
      };
      setCourses((prev) => [newCourse, ...prev]);
      return newCourse;
    },
    [user]
  );

  const updateCourse = useCallback((courseId: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c)));
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  const value = useMemo(
    () => ({ courses, myCourses, addCourse, updateCourse, deleteCourse }),
    [courses, myCourses, addCourse, updateCourse, deleteCourse]
  );

  return <TeacherDataContext.Provider value={value}>{children}</TeacherDataContext.Provider>;
};

export function useTeacherData(): TeacherDataContextValue {
  const ctx = useContext(TeacherDataContext);
  if (!ctx) throw new Error('useTeacherData must be used within a TeacherDataProvider');
  return ctx;
}
