import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { AppUser, UserRole, Student, Teacher } from '../types';
import { currentStudent } from '../data/students';
import { currentTeacher } from '../data/teachers';

interface RegisterPayload {
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (_email: string, _password: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setUser(role === 'teacher' ? currentTeacher : currentStudent);
    setIsLoading(false);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    setUser(role === 'teacher' ? currentTeacher : currentStudent);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    if (payload.role === 'teacher') {
      const newTeacher: Teacher = {
        ...currentTeacher,
        id: `teacher-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        courseIds: [],
        totalStudents: 0,
        totalRevenue: 0,
        rating: 0,
      };
      setUser(newTeacher);
    } else {
      const newStudent: Student = {
        ...currentStudent,
        id: `student-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        enrolledCourseIds: [],
        favoriteCourseIds: [],
        purchasedCourseIds: [],
      };
      setUser(newStudent);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateProfile = useCallback((updates: Partial<AppUser>) => {
    setUser((prev) => (prev ? ({ ...prev, ...updates } as AppUser) : prev));
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, loginAsDemo, register, logout, updateProfile }),
    [user, isLoading, login, loginAsDemo, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
