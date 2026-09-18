import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { AppUser, GradeTrack, UserRole } from '../types';
import { fetchMe, loginRequest, registerRequest, updateMe } from '../api/auth';
import { clearAuthTokens, loadStoredTokens, setAuthFailureHandler } from '../api/client';

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  student: { email: 'mariem.abdellahi@gmail.com', password: 'password123' },
  teacher: { email: 'mohamed.sidiahmed@educonnect.mr', password: 'password123' },
};

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  gradeTrack?: GradeTrack;
  headline?: string;
  teachingCategoryIds?: string[];
}

interface AuthContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthTokens();
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => setUser(null));
    return () => setAuthFailureHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      const tokens = await loadStoredTokens();
      if (tokens) {
        try {
          setUser(await fetchMe());
        } catch {
          await clearAuthTokens();
        }
      }
      setIsBootstrapping(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      setUser(await loginRequest(email, password));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    await login(creds.email, creds.password);
  }, [login]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      setUser(await registerRequest(payload));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AppUser>) => {
    setUser(await updateMe(updates));
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, isBootstrapping, login, loginAsDemo, register, logout, updateProfile }),
    [user, isLoading, isBootstrapping, login, loginAsDemo, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
