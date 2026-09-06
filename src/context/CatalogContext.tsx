import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Category, Course } from '../types';
import { fetchCategories, fetchCourses } from '../api/catalog';

interface CatalogContextValue {
  courses: Course[];
  categories: Category[];
  loading: boolean;
  getCourseById: (id: string) => Course | undefined;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [coursesData, categoriesData] = await Promise.all([fetchCourses(), fetchCategories()]);
    setCourses(coursesData);
    setCategories(categoriesData);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const getCourseById = useCallback((id: string) => courses.find((c) => c.id === id), [courses]);

  const value = useMemo(
    () => ({ courses, categories, loading, getCourseById, refresh }),
    [courses, categories, loading, getCourseById, refresh]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
}
