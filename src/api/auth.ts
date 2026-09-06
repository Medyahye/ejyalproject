import { AppUser, UserRole } from '../types';
import { apiRequest, setAuthTokens } from './client';

interface AuthResponse {
  access: string;
  refresh: string;
  user: AppUser;
}

export async function loginRequest(email: string, password: string): Promise<AppUser> {
  const data = await apiRequest<AuthResponse>('/auth/login/', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  await setAuthTokens(data.access, data.refresh);
  return data.user;
}

export async function registerRequest(payload: { fullName: string; email: string; password: string; role: UserRole }): Promise<AppUser> {
  const data = await apiRequest<AuthResponse>('/auth/register/', {
    method: 'POST',
    auth: false,
    body: payload,
  });
  await setAuthTokens(data.access, data.refresh);
  return data.user;
}

export function fetchMe(): Promise<AppUser> {
  return apiRequest<AppUser>('/auth/me/');
}

export function updateMe(updates: Partial<AppUser>): Promise<AppUser> {
  return apiRequest<AppUser>('/auth/me/', { method: 'PATCH', body: updates });
}
