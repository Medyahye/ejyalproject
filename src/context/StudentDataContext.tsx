import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Course, CartItem, OfferType, Payment } from '../types';
import {
  addFavoriteRequest,
  addFavoriteTeacherRequest,
  addToCartRequest,
  checkoutRequest,
  EnrollmentEntry,
  fetchCart,
  fetchEnrollments,
  fetchFavorites,
  fetchFavoriteTeachers,
  OrderResult,
  recordLessonView,
  LessonViewResult,
  removeFavoriteRequest,
  removeFavoriteTeacherRequest,
  removeFromCartRequest,
  updateEnrollmentProgressRequest,
} from '../api/commerce';
import { useCatalog } from './CatalogContext';

interface StudentDataContextValue {
  favoriteIds: string[];
  toggleFavorite: (courseId: string) => void;
  isFavorite: (courseId: string) => boolean;

  favoriteTeacherIds: string[];
  toggleFavoriteTeacher: (teacherId: string) => void;
  isFavoriteTeacher: (teacherId: string) => boolean;

  cartItems: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  isInCart: (courseId: string) => boolean;
  clearCart: () => void;
  cartTotal: number;

  /** Active (validated) purchases only. */
  purchasedCourseIds: string[];
  /** Ordered and waiting for the admin to validate the WhatsApp payment capture. */
  pendingCourseIds: string[];
  placeOrder: (method: Payment['method'], offer?: OfferType, courseIds?: string[]) => Promise<OrderResult>;
  isPurchased: (courseId: string) => boolean;
  isPending: (courseId: string) => boolean;
  enrollmentFor: (courseId: string) => EnrollmentEntry | undefined;
  recordView: (courseId: string, lessonId: string) => Promise<LessonViewResult>;

  courseProgress: Record<string, number>;
  setCourseProgress: (courseId: string, progress: number) => void;

  refresh: () => Promise<void>;
}

const StudentDataContext = createContext<StudentDataContextValue | undefined>(undefined);

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refresh: refreshCatalog } = useCatalog();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteTeacherIds, setFavoriteTeacherIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentEntry[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const loadAll = useCallback(async () => {
    const [favorites, favTeachers, cart, enrollmentList] = await Promise.all([
      fetchFavorites(),
      fetchFavoriteTeachers(),
      fetchCart(),
      fetchEnrollments(),
    ]);
    setFavoriteIds(favorites.map((f) => f.course.id));
    setFavoriteTeacherIds(favTeachers.map((f) => f.teacherId));
    setCartItems(cart);
    setEnrollments(enrollmentList);
    setProgressMap(Object.fromEntries(enrollmentList.map((e) => [e.course.id, e.progress])));
  }, []);

  useEffect(() => {
    loadAll().catch(() => {});
  }, [loadAll]);

  const toggleFavorite = useCallback(
    (courseId: string) => {
      const isFav = favoriteIds.includes(courseId);
      setFavoriteIds((prev) => (isFav ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
      (isFav ? removeFavoriteRequest(courseId) : addFavoriteRequest(courseId)).catch(() => loadAll());
    },
    [favoriteIds, loadAll]
  );
  const isFavorite = useCallback((courseId: string) => favoriteIds.includes(courseId), [favoriteIds]);

  const toggleFavoriteTeacher = useCallback(
    (teacherId: string) => {
      const isFav = favoriteTeacherIds.includes(teacherId);
      setFavoriteTeacherIds((prev) => (isFav ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]));
      (isFav ? removeFavoriteTeacherRequest(teacherId) : addFavoriteTeacherRequest(teacherId)).catch(() => loadAll());
    },
    [favoriteTeacherIds, loadAll]
  );
  const isFavoriteTeacher = useCallback((teacherId: string) => favoriteTeacherIds.includes(teacherId), [favoriteTeacherIds]);

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

  const cartTotal = useMemo(() => cartItems.reduce((sum, i) => sum + (i.course.isFree ? 0 : i.course.price), 0), [cartItems]);

  const purchasedCourseIds = useMemo(() => enrollments.filter((e) => e.status === 'active').map((e) => e.course.id), [enrollments]);
  const pendingCourseIds = useMemo(() => enrollments.filter((e) => e.status === 'pending').map((e) => e.course.id), [enrollments]);

  const placeOrder = useCallback(
    async (method: Payment['method'], offer: OfferType = 'single', courseIds?: string[]) => {
      const result = await checkoutRequest(method, offer, courseIds);
      await Promise.all([loadAll(), refreshCatalog()]);
      return result;
    },
    [loadAll, refreshCatalog]
  );

  const isPurchased = useCallback((courseId: string) => purchasedCourseIds.includes(courseId), [purchasedCourseIds]);
  const isPending = useCallback((courseId: string) => pendingCourseIds.includes(courseId), [pendingCourseIds]);
  const enrollmentFor = useCallback((courseId: string) => enrollments.find((e) => e.course.id === courseId), [enrollments]);

  const recordView = useCallback(async (courseId: string, lessonId: string) => {
    const result = await recordLessonView(lessonId);
    setEnrollments((prev) =>
      prev.map((e) =>
        e.course.id === courseId ? { ...e, lessonViews: { ...e.lessonViews, [lessonId]: result.viewsUsed } } : e
      )
    );
    return result;
  }, []);

  const setCourseProgress = useCallback(
    (courseId: string, progress: number) => {
      setProgressMap((prev) => ({ ...prev, [courseId]: progress }));
      const enrollment = enrollments.find((e) => e.course.id === courseId);
      if (enrollment) updateEnrollmentProgressRequest(enrollment.id, progress).catch(() => {});
    },
    [enrollments]
  );

  const refresh = useCallback(async () => {
    await Promise.all([loadAll(), refreshCatalog()]);
  }, [loadAll, refreshCatalog]);

  const value = useMemo(
    () => ({
      favoriteIds, toggleFavorite, isFavorite,
      favoriteTeacherIds, toggleFavoriteTeacher, isFavoriteTeacher,
      cartItems, addToCart, removeFromCart, isInCart, clearCart, cartTotal,
      purchasedCourseIds, pendingCourseIds, placeOrder, isPurchased, isPending, enrollmentFor, recordView,
      courseProgress: progressMap, setCourseProgress,
      refresh,
    }),
    [
      favoriteIds, toggleFavorite, isFavorite, favoriteTeacherIds, toggleFavoriteTeacher, isFavoriteTeacher,
      cartItems, addToCart, removeFromCart, isInCart, clearCart, cartTotal,
      purchasedCourseIds, pendingCourseIds, placeOrder, isPurchased, isPending, enrollmentFor, recordView,
      progressMap, setCourseProgress, refresh,
    ]
  );

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>;
};

export function useStudentData(): StudentDataContextValue {
  const ctx = useContext(StudentDataContext);
  if (!ctx) throw new Error('useStudentData must be used within a StudentDataProvider');
  return ctx;
}
