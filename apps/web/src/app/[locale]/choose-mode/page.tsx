'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { ModeSelector } from '@/components/shared/mode-selector';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from '@/i18n/navigation';

const MODE_KEY = 'lm_profile_mode';

export default function ChooseModePage() {
  const t = useTranslations('mode');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSelect = (mode: 'ISLAMIC' | 'GENERAL') => {
    sessionStorage.setItem(MODE_KEY, mode);
    router.push(`/onboarding?mode=${mode}`);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-20">
      <h1 className="text-3xl font-bold text-center mb-4">{t('title')}</h1>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">{t('subtitle')}</p>
      <ModeSelector onSelect={handleSelect} />
    </div>
  );
}
