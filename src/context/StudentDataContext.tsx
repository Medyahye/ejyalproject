import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Course, CartItem } from '../types';
import { currentStudent } from '../data/students';

interface StudentDataContextValue {
  favoriteIds: string[];
  toggleFavorite: (courseId: string) => void;
  isFavorite: (courseId: string) => boolean;

  cartItems: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  isInCart: (courseId: string) => boolean;
  clearCart: () => void;
  cartTotal: number;

  purchasedCourseIds: string[];
  purchaseCart: () => void;
  isPurchased: (courseId: string) => boolean;

  courseProgress: Record<string, number>;
  setCourseProgress: (courseId: string, progress: number) => void;
}

const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined);

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(currentStudent.favoriteCourseIds);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>(currentStudent.purchasedCourseIds);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({
    'course-1': 0.62,
    'course-3': 0.3,
    'course-5': 0.9,
  });

  const toggleFavorite = useCallback((courseId: string) => {
    setFavoriteIds((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
  }, []);

  const isFavorite = useCallback((courseId: string) => favoriteIds.includes(courseId), [favoriteIds]);

  const addToCart = useCallback((course: Course) => {
    setCartItems((prev) => (prev.some((i) => i.course.id === course.id) ? prev : [...prev, { course, addedAt: new Date().toISOString() }]));
  }, []);

  const removeFromCart = useCallback((courseId: string) => {
    setCartItems((prev) => prev.filter((i) => i.course.id !== courseId));
  }, []);

  const isInCart = useCallback((courseId: string) => cartItems.some((i) => i.course.id === courseId), [cartItems]);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartTotal = useMemo(() => cartItems.reduce((sum, i) => sum + i.course.price, 0), [cartItems]);

  const purchaseCart = useCallback(() => {
    setPurchasedCourseIds((prev) => {
      const newIds = cartItems.map((i) => i.course.id).filter((id) => !prev.includes(id));
      return [...prev, ...newIds];
    });
    setCartItems([]);
  }, [cartItems]);

  const isPurchased = useCallback((courseId: string) => purchasedCourseIds.includes(courseId), [purchasedCourseIds]);

  const setCourseProgress = useCallback((courseId: string, progress: number) => {
    setProgressMap((prev) => ({ ...prev, [courseId]: progress }));
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      toggleFavorite,
      isFavorite,
      cartItems,
      addToCart,
      removeFromCart,
      isInCart,
      clearCart,
      cartTotal,
      purchasedCourseIds,
      purchaseCart,
      isPurchased,
      courseProgress: progressMap,
      setCourseProgress,
    }),
    [favoriteIds, toggleFavorite, isFavorite, cartItems, addToCart, removeFromCart, isInCart, clearCart, cartTotal, purchasedCourseIds, purchaseCart, isPurchased, progressMap, setCourseProgress]
  );

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>;
};

export function useStudentData(): StudentDataContextValue {
  const ctx = useContext(StudentDataContext);
  if (!ctx) throw new Error('useStudentData must be used within a StudentDataProvider');
  return ctx;
}
