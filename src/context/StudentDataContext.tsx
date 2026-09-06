import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Course, CartItem, Payment } from '../types';
import {
  addFavoriteRequest,
  addToCartRequest,
  checkoutCartRequest,
  fetchCart,
  fetchEnrollments,
  fetchFavorites,
  removeFavoriteRequest,
  removeFromCartRequest,
  updateEnrollmentProgressRequest,
} from '../api/commerce';
import { useCatalog } from './CatalogContext';

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
  purchaseCart: (method: Payment['method']) => Promise<void>;
  isPurchased: (courseId: string) => boolean;

  courseProgress: Record<string, number>;
  setCourseProgress: (courseId: string, progress: number) => void;
}

const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined);

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refresh: refreshCatalog } = useCatalog();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [enrollmentIdByCourse, setEnrollmentIdByCourse] = useState<Record<string, string>>({});

  const loadAll = useCallback(async () => {
    const [favorites, cart, enrollments] = await Promise.all([fetchFavorites(), fetchCart(), fetchEnrollments()]);
    setFavoriteIds(favorites.map((f) => f.course.id));
    setCartItems(cart);
    setPurchasedCourseIds(enrollments.map((e) => e.course.id));
    setProgressMap(Object.fromEntries(enrollments.map((e) => [e.course.id, e.progress])));
    setEnrollmentIdByCourse(Object.fromEntries(enrollments.map((e) => [e.course.id, e.id])));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleFavorite = useCallback(
    (courseId: string) => {
      setFavoriteIds((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
      const isFav = favoriteIds.includes(courseId);
      (isFav ? removeFavoriteRequest(courseId) : addFavoriteRequest(courseId)).catch(() => loadAll());
    },
    [favoriteIds, loadAll]
  );

  const isFavorite = useCallback((courseId: string) => favoriteIds.includes(courseId), [favoriteIds]);

  const addToCart = useCallback(
    (course: Course) => {
      if (cartItems.some((i) => i.course.id === course.id)) return;
      setCartItems((prev) => [...prev, { course, addedAt: new Date().toISOString() }]);
      addToCartRequest(course.id).catch(() => loadAll());
    },
    [cartItems, loadAll]
  );

  const removeFromCart = useCallback(
    (courseId: string) => {
      setCartItems((prev) => prev.filter((i) => i.course.id !== courseId));
      removeFromCartRequest(courseId).catch(() => loadAll());
    },
    [loadAll]
  );

  const isInCart = useCallback((courseId: string) => cartItems.some((i) => i.course.id === courseId), [cartItems]);

  const clearCart = useCallback(() => {
    cartItems.forEach((i) => removeFromCartRequest(i.course.id).catch(() => {}));
    setCartItems([]);
  }, [cartItems]);

  const cartTotal = useMemo(() => cartItems.reduce((sum, i) => sum + i.course.price, 0), [cartItems]);

  const purchaseCart = useCallback(
    async (method: Payment['method']) => {
      await checkoutCartRequest(method);
      await Promise.all([loadAll(), refreshCatalog()]);
    },
    [loadAll, refreshCatalog]
  );

  const isPurchased = useCallback((courseId: string) => purchasedCourseIds.includes(courseId), [purchasedCourseIds]);

  const setCourseProgress = useCallback(
    (courseId: string, progress: number) => {
      setProgressMap((prev) => ({ ...prev, [courseId]: progress }));
      const enrollmentId = enrollmentIdByCourse[courseId];
      if (enrollmentId) updateEnrollmentProgressRequest(enrollmentId, progress).catch(() => {});
    },
    [enrollmentIdByCourse]
  );

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
