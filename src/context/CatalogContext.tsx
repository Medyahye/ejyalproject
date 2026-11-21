import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Category, Course, PublicTeacher, SchoolSettings, SchoolTerm, Track } from '../types';
import { fetchCategories, fetchCourses, fetchSettings, fetchTeachers, fetchTerms, fetchTracks } from '../api/catalog';

interface CatalogContextValue {
  courses: Course[];
  categories: Category[];
  tracks: Track[];
  terms: SchoolTerm[];
  teachers: PublicTeacher[];
  settings: SchoolSettings | null;
  loading: boolean;
  getCourseById: (id: string) => Course | undefined;
  getTrack: (id?: string | null) => Track | undefined;
  getTeacher: (id?: string | null) => PublicTeacher | undefined;
  getTerm: (n: number) => SchoolTerm | undefined;
  currentTerm: SchoolTerm | undefined;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [terms, setTerms] = useState<SchoolTerm[]>([]);
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [coursesData, categoriesData, tracksData, termsData, teachersData, settingsData] = await Promise.all([
      fetchCourses(),
      fetchCategories(),
      fetchTracks(),
      fetchTerms(),
      fetchTeachers(),
      fetchSettings(),
    ]);
    setCourses(coursesData);
    setCategories(categoriesData);
    setTracks(tracksData);
    setTerms(termsData);
    setTeachers(teachersData);
    setSettings(settingsData);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch {
        // Network errors surface as empty states; pull-to-refresh retries.
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const getCourseById = useCallback((id: string) => courses.find((c) => c.id === id), [courses]);
  const getTrack = useCallback((id?: string | null) => tracks.find((t) => t.id === id), [tracks]);
  const getTeacher = useCallback((id?: string | null) => teachers.find((t) => t.id === id), [teachers]);
  const getTerm = useCallback((n: number) => terms.find((t) => t.number === n), [terms]);
  const currentTerm = useMemo(
    () => terms.find((t) => t.isCurrent) ?? [...terms].reverse().find((t) => t.isStarted) ?? terms[0],
    [terms]
  );

  const value = useMemo(
    () => ({
      courses, categories, tracks, terms, teachers, settings, loading,
      getCourseById, getTrack, getTeacher, getTerm, currentTerm, refresh,
    }),
    [courses, categories, tracks, terms, teachers, settings, loading, getCourseById, getTrack, getTeacher, getTerm, currentTerm, refresh]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
}
