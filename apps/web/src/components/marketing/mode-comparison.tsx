'use client';

import { useTranslations } from 'next-intl';
import { ModeSelector } from '@/components/shared/mode-selector';

export function ModeComparison() {
  const t = useTranslations('mode');

  return (
    <section className="container py-20">
      <h2 className="text-3xl font-bold text-center mb-4">{t('title')}</h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Choose the experience that fits your values and family expectations.
      </p>
      <ModeSelector />
    </section>
  );
}
