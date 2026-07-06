import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthTokens } from '@/types/api';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:5002';

export const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'lm_access_token';
const REFRESH_KEY = 'lm_refresh_token';

export function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function storeTokens(tokens: AuthTokens) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) return null;

  try {
    const res = await axios.post<ApiResponse<AuthTokens>>(`${baseURL}/api/v1/auth/refresh`, {
      refreshToken,
    });
    const data = res.data.data;
    if (data?.access_token) {
      storeTokens(data);
      return data.access_token;
    }
  } catch {
    clearTokens();
  }
  return null;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = getStoredTokens();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiResponse>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error.response?.data ?? error);
  },
);

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data as T;
}

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return unwrap(res);
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body);
  return unwrap(res);
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put<ApiResponse<T>>(url, body);
  return unwrap(res);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(url);
  return unwrap(res);
}
