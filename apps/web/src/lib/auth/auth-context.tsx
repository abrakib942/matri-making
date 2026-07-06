'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/api/endpoints';
import { clearTokens, getStoredTokens, storeTokens } from '@/lib/api/client';
import type { AuthUser } from '@/types/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/user-profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(r => r.json())
        .then(res => {
          if (res.data) setUser({ id: res.data.id, name: res.data.name, email: res.data.email });
        })
        .catch(() => clearTokens())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.signIn({ email, password });
    storeTokens(data);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const { refreshToken } = getStoredTokens();
    if (refreshToken) {
      try {
        await authApi.signOut(refreshToken);
      } catch {
        /* ignore */
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      setUser,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
