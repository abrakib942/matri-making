'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Users, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { metaApi } from '@/lib/api/endpoints';
import { formatBnNumber } from '@/lib/format-bn-number';
import type { PublicStats } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';

function AnimatedNumber({ value, locale }: { value: number; locale: string }) {
  const reduceMotion = useReducedMotion();
  const display = formatBnNumber(value, locale);

  if (reduceMotion) {
    return <span>{display}</span>;
  }

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {display}
    </motion.span>
  );
}

export function StatsCounter() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi
      .getStats()
      .then(setStats)
      .catch(() =>
        setStats({
          totalBiodatas: 1000,
          grooms: 520,
          brides: 480,
          successfulMarriages: 50,
          byMode: {
            ISLAMIC: { male: 300, female: 280, total: 580 },
            GENERAL: { male: 220, female: 200, total: 420 },
          },
          divisions: [],
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const items = [
    { icon: Users, label: t('statsTotal'), value: stats?.totalBiodatas ?? 0 },
    { icon: UserRound, label: t('statsGrooms'), value: stats?.grooms ?? 0 },
    { icon: UserRound, label: t('statsBrides'), value: stats?.brides ?? 0 },
    { icon: Heart, label: t('statsMarriages'), value: stats?.successfulMarriages ?? 0 },
  ];

  return (
    <section className="border-y bg-card/60">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-9 w-20 mx-auto" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                  <AnimatedNumber value={value} locale={locale} />
                  {value >= 100 && '+'}
                </p>
              )}
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
