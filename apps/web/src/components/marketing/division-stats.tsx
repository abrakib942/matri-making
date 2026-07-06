'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { metaApi } from '@/lib/api/endpoints';
import { formatBnNumber } from '@/lib/format-bn-number';
import type { DivisionStat, PublicStats } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Section, SectionHeader } from '@/components/ui/section';

export function DivisionStats() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [divisions, setDivisions] = useState<DivisionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi
      .getStats()
      .then(data => setDivisions(data.divisions ?? []))
      .catch(() => setDivisions([]))
      .finally(() => setLoading(false));
  }, []);

  const maxTotal = Math.max(...divisions.map(d => d.grooms + d.brides), 1);

  return (
    <Section spacing="md">
      <div className="container">
        <SectionHeader title={t('divisionTitle')} description={t('divisionDesc')} />
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {divisions.map(div => {
              const total = div.grooms + div.brides;
              const pct = (total / maxTotal) * 100;
              const name = locale === 'bn' ? div.nameBn : div.nameEn;
              return (
                <div
                  key={div.divisionId}
                  className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">{name}</p>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatBnNumber(total, locale)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                    <div
                      className="h-full bg-primary/70"
                      style={{ width: `${div.grooms > 0 ? (div.grooms / total) * pct : 0}%` }}
                      title={t('statsGrooms')}
                    />
                    <div
                      className="h-full bg-primary/30"
                      style={{ width: `${div.brides > 0 ? (div.brides / total) * pct : 0}%` }}
                      title={t('statsBrides')}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {t('statsGrooms')}: {formatBnNumber(div.grooms, locale)}
                    </span>
                    <span>
                      {t('statsBrides')}: {formatBnNumber(div.brides, locale)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}
