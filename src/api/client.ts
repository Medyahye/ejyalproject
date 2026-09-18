import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const ACCESS_KEY = 'educonnect_access_token';
const REFRESH_KEY = 'educonnect_refresh_token';

function formatErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== 'object') return `Erreur ${status}`;
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === 'string') return obj.detail;
  const messages: string[] = [];
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) messages.push(...value.map(String));
    else if (typeof value === 'string') messages.push(value);
  }
  return messages.length > 0 ? messages.join('\n') : `Erreur ${status}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let bootstrapped = false;
let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null) {
  onAuthFailure = handler;
}

export async function loadStoredTokens(): Promise<{ access: string; refresh: string } | null> {
  if (!bootstrapped) {
    const [access, refresh] = await Promise.all([AsyncStorage.getItem(ACCESS_KEY), AsyncStorage.getItem(REFRESH_KEY)]);
    accessToken = access;
    refreshToken = refresh;
    bootstrapped = true;
  }
  return accessToken && refreshToken ? { access: accessToken, refresh: refreshToken } : null;
}

export async function setAuthTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  bootstrapped = true;
  await Promise.all([AsyncStorage.setItem(ACCESS_KEY, access), AsyncStorage.setItem(REFRESH_KEY, refresh)]);
}

export async function clearAuthTokens() {
  accessToken = null;
  refreshToken = null;
  bootstrapped = true;
  await Promise.all([AsyncStorage.removeItem(ACCESS_KEY), AsyncStorage.removeItem(REFRESH_KEY)]);
}

async function tryRefreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.access;
    await AsyncStorage.setItem(ACCESS_KEY, data.access);
    return true;
  } catch {
    return false;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const run = async (): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await run();

  if (res.status === 401 && auth && refreshToken) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      res = await run();
    } else {
      await clearAuthTokens();
      onAuthFailure?.();
    }
  }

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, formatErrorMessage(data, res.status));
  }

  return data as T;
}
