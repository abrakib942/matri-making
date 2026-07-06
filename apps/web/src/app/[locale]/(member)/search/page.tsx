'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BiodataCard } from '@/components/profile/biodata-card';
import { BiodataCardSkeleton } from '@/components/profile/biodata-card-skeleton';
import { EnumSelect } from '@/components/shared/enum-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LocationPicker } from '@/components/shared/location-picker';
import { searchApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';
import { cn } from '@/lib/utils';

interface Filters {
  mode: string;
  gender: string;
  ageMin: string;
  ageMax: string;
  divisionId: number | null;
  districtId: number | null;
  query: string;
}

const defaultFilters: Filters = {
  mode: '',
  gender: '',
  ageMin: '',
  ageMax: '',
  divisionId: null,
  districtId: null,
  query: '',
};

type SortBy = 'newest' | 'lastActive';

export default function SearchPage() {
  const t = useTranslations('search');
  const c = useTranslations('common');
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [items, setItems] = useState<BiodataCardType[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setFilters(f => ({
      ...f,
      gender: searchParams.get('gender') ?? '',
      ageMin: searchParams.get('ageMin') ?? '',
      ageMax: searchParams.get('ageMax') ?? '',
      divisionId: searchParams.get('divisionId') ? Number(searchParams.get('divisionId')) : null,
      districtId: searchParams.get('districtId') ? Number(searchParams.get('districtId')) : null,
    }));
  }, [searchParams]);

  const buildBody = useCallback(
    (nextCursor?: number | null) => {
      const body: Record<string, unknown> = { limit: 12, sortBy };
      if (nextCursor) body.cursor = nextCursor;
      if (filters.mode) body.mode = filters.mode;
      if (filters.gender) body.gender = filters.gender;
      if (filters.ageMin) body.ageMin = Number(filters.ageMin);
      if (filters.ageMax) body.ageMax = Number(filters.ageMax);
      if (filters.districtId) body.districtIds = [filters.districtId];
      if (filters.divisionId && !filters.districtId) body.divisionIds = [filters.divisionId];
      if (filters.query.trim()) body.biodataNo = filters.query.trim();
      return body;
    },
    [filters, sortBy],
  );

  const runSearch = useCallback(
    async (append = false, nextCursor?: number | null) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await searchApi.search(buildBody(nextCursor));
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
    [buildBody],
  );

  useEffect(() => {
    runSearch(false);
  }, [sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortChips: { id: SortBy; label: string }[] = [
    { id: 'newest', label: t('sortNewest') },
    { id: 'lastActive', label: t('sortActive') },
  ];

  const advancedFilters = (
    <div className="space-y-5">
      <EnumSelect
        category="profileMode"
        label={t('filterMode')}
        value={filters.mode}
        onChange={v => setFilters(f => ({ ...f, mode: v }))}
      />
      <EnumSelect
        category="gender"
        label={t('filterGender')}
        value={filters.gender}
        onChange={v => setFilters(f => ({ ...f, gender: v }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('filterAgeMin')}</label>
          <Input
            type="number"
            value={filters.ageMin}
            onChange={e => setFilters(f => ({ ...f, ageMin: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('filterAgeMax')}</label>
          <Input
            type="number"
            value={filters.ageMax}
            onChange={e => setFilters(f => ({ ...f, ageMax: e.target.value }))}
          />
        </div>
      </div>
      <LocationPicker
        divisionId={filters.divisionId}
        districtId={filters.districtId}
        onDivisionChange={id => setFilters(f => ({ ...f, divisionId: id, districtId: null }))}
        onDistrictChange={id => setFilters(f => ({ ...f, districtId: id }))}
      />
      <Button
        className="w-full rounded-full"
        onClick={() => {
          runSearch(false);
          setSheetOpen(false);
        }}
        disabled={loading}
      >
        {loading ? c('loading') : t('applyFilters')}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader title={t('discoverTitle')} description={t('discoverDesc')} />

      <div className="glass-panel p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-11 h-12 rounded-full border-0 bg-secondary/60 focus-visible:ring-primary"
            placeholder={t('discoverPlaceholder')}
            value={filters.query}
            onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && runSearch(false)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sortChips.map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setSortBy(chip.id)}
              className={cn('chip-filter', sortBy === chip.id && 'chip-filter-active')}
            >
              {chip.label}
            </button>
          ))}

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button type="button" className="chip-filter gap-2 ml-auto">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t('filters')}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t('filters')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{advancedFilters}</div>
            </SheetContent>
          </Sheet>
        </div>
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
              setFilters(defaultFilters);
              runSearch(false);
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          {items.map(p => (
            <BiodataCard key={p.id} profile={p} variant="horizontal" />
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
