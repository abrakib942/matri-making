'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BiodataCard } from '@/components/profile/biodata-card';
import { BiodataCardSkeleton } from '@/components/profile/biodata-card-skeleton';
import { BiodataSearchForm } from '@/components/search/biodata-search-form';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/lib/auth/auth-context';
import { searchApi } from '@/lib/api/endpoints';
import {
  biodataFiltersToSearchBody,
  defaultBiodataSearchFilters,
  parseFiltersFromSearchParams,
  type BiodataSearchFilters,
} from '@/lib/search/biodata-search-filters';
import type { BiodataCard as BiodataCardType } from '@/types/api';
import { cn } from '@/lib/utils';

type SortBy = 'newest' | 'lastActive';

export default function SearchPage() {
  const t = useTranslations('search');
  const c = useTranslations('common');
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState<BiodataSearchFilters>(defaultBiodataSearchFilters);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [minMatchScore, setMinMatchScore] = useState<number | null>(null);
  const [items, setItems] = useState<BiodataCardType[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    const merged: BiodataSearchFilters = {
      ...defaultBiodataSearchFilters,
      ...parsed,
      ageMin: searchParams.get('ageMin') || defaultBiodataSearchFilters.ageMin,
      ageMax: searchParams.get('ageMax') || defaultBiodataSearchFilters.ageMax,
    };
    setFilters(merged);
    runSearch(false, null, merged);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildBody = useCallback(
    (
      nextCursor?: number | null,
      f = filters,
      overrides?: { sortBy?: SortBy; minMatchScore?: number | null },
    ) =>
      biodataFiltersToSearchBody(f, {
        cursor: nextCursor ?? undefined,
        sortBy: overrides?.sortBy ?? sortBy,
        minMatchScore:
          overrides?.minMatchScore !== undefined ? overrides.minMatchScore : minMatchScore,
      }),
    [filters, sortBy, minMatchScore],
  );

  const runSearch = useCallback(
    async (
      append = false,
      nextCursor?: number | null,
      f = filters,
      overrides?: { sortBy?: SortBy; minMatchScore?: number | null },
    ) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await searchApi.search(buildBody(nextCursor, f, overrides));
        const list = (res.items ?? []) as BiodataCardType[];
        setItems(prev => (append ? [...prev, ...list] : list));
        setCursor(res.nextCursor ?? null);
      } catch {
        if (!append) setItems([]);
        setCursor(null);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildBody, filters],
  );

  const applySort = (nextSort: SortBy) => {
    setSortBy(nextSort);
    runSearch(false, null, filters, { sortBy: nextSort });
  };

  const applyMatchScore = (score: number | null) => {
    setMinMatchScore(score);
    runSearch(false, null, filters, { minMatchScore: score });
  };

  const matchPresets = [
    { value: null as number | null, label: t('matchAny') },
    { value: 80, label: '80%+' },
    { value: 90, label: '90%+' },
    { value: 95, label: '95%+' },
  ];

  const sortChips: { id: SortBy; label: string }[] = [
    { id: 'newest', label: t('sortNewest') },
    { id: 'lastActive', label: t('sortActive') },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader title={t('discoverTitle')} description={t('discoverDesc')} />

      <div className="glass-panel p-5 md:p-7">
        <BiodataSearchForm
          value={filters}
          onChange={setFilters}
          showQuery
          loading={loading}
          onSubmit={f => {
            setFilters(f);
            runSearch(false, null, f);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs text-muted-foreground mr-1">{t('sortBy')}</span>
        {sortChips.map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => applySort(chip.id)}
            className={cn('chip-filter', sortBy === chip.id && 'chip-filter-active')}
          >
            {chip.label}
          </button>
        ))}

        {isAuthenticated &&
          matchPresets.map(preset => (
            <button
              key={String(preset.value)}
              type="button"
              onClick={() => applyMatchScore(preset.value)}
              className={cn('chip-filter', minMatchScore === preset.value && 'chip-filter-active')}
            >
              {preset.label}
            </button>
          ))}
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BiodataCardSkeleton key={i} variant="horizontal" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('noResults')}
          description={t('noResultsDesc')}
          action={{
            label: t('resetFilters'),
            onClick: () => {
              setFilters(defaultBiodataSearchFilters);
              runSearch(false, null, defaultBiodataSearchFilters);
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {items.map(p => (
            <BiodataCard
              key={p.id}
              profile={p}
              variant="horizontal"
              showCompatibility={isAuthenticated}
            />
          ))}
        </div>
      )}

      {cursor != null && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => runSearch(true, cursor)}
            disabled={loadingMore}
          >
            {loadingMore ? c('loading') : t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
