'use client';

import { useEffect, useState } from 'react';
import { getUser, isLoggedIn } from '@/libs/auth';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
}

/**
 * Client-side authentication hook
 * Provides authentication state for client components
 *
 * @returns {UseAuthReturn} Object with isAuthenticated, user, and isLoading
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, isLoading } = useAuth();
 *
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <LoginPrompt />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const loggedIn = isLoggedIn();
      setIsAuthenticated(loggedIn);

      if (loggedIn) {
        const userData = getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}
