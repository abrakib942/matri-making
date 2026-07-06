'use client';

import { useTranslations } from 'next-intl';

export function StatsSection() {
  const t = useTranslations('home');

  const stats = [
    { value: '1,000+', label: t('statsProfiles') },
    { value: '50+', label: t('statsMarriages') },
  ];

  return (
    <section className="container py-12">
      <div className="flex justify-center gap-16">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
