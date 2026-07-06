'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileSectionEditor } from '@/components/profile/profile-section-editor';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from '@/i18n/navigation';
import type { ProfileModeType } from '@/types/api';

const MODE_KEY = 'lm_profile_mode';

export default function OnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ProfileModeType | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fromQuery = searchParams.get('mode') as ProfileModeType | null;
    const fromStorage =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem(MODE_KEY) as ProfileModeType | null)
        : null;
    const resolved = fromQuery === 'ISLAMIC' || fromQuery === 'GENERAL' ? fromQuery : fromStorage;

    if (resolved) {
      setMode(resolved);
      sessionStorage.setItem(MODE_KEY, resolved);
    } else if (!isLoading && isAuthenticated) {
      router.replace('/choose-mode');
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  if (isLoading || !isAuthenticated || !mode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <ProfileSectionEditor mode={mode} onComplete={() => router.push('/my-profile')} />
    </div>
  );
}
