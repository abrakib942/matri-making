'use client';

import {
  BookOpen,
  ChevronDown,
  Heart,
  MapPin,
  Moon,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  FilterField,
  GenderChoice,
  ModePill,
  filterInputClass,
  filterSelectClass,
} from './search-filter-field';
import { LocationPicker } from '@/components/shared/location-picker';
import { useEnums } from '@/lib/providers/enum-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type BiodataSearchFilters,
  countActiveAdvancedFilters,
  defaultBiodataSearchFilters,
} from '@/lib/search/biodata-search-filters';
import { cn } from '@/lib/utils';

interface Props {
  value?: BiodataSearchFilters;
  onChange?: (filters: BiodataSearchFilters) => void;
  onSubmit: (filters: BiodataSearchFilters) => void;
  loading?: boolean;
  showQuery?: boolean;
  className?: string;
}

function EnumFilterSelect({
  category,
  value,
  onChange,
  placeholder,
}: {
  category: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const { catalog, isLoading } = useEnums();
  const options = catalog[category] ?? [];

  return (
    <select
      className={filterSelectClass}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={isLoading}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function BiodataSearchForm({
  value,
  onChange,
  onSubmit,
  loading,
  showQuery = false,
  className,
}: Props) {
  const t = useTranslations('search');
  const h = useTranslations('home');
  const c = useTranslations('common');

  const [internal, setInternal] = useState<BiodataSearchFilters>(defaultBiodataSearchFilters);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const filters = value ?? internal;
  const patch = (next: Partial<BiodataSearchFilters>) => {
    const updated = { ...filters, ...next };
    if (onChange) onChange(updated);
    else setInternal(updated);
  };

  const advancedCount = useMemo(() => countActiveAdvancedFilters(filters), [filters]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSubmit(filters);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {showQuery && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className={cn('pl-11', filterInputClass)}
            placeholder={t('discoverPlaceholder')}
            value={filters.query}
            onChange={e => patch({ query: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-label">{h('heroSearchLabel')}</p>
            <p className="text-base font-semibold font-bengali mt-1">{t('searchLookingFor')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ModePill
              label={t('filterModeAny')}
              selected={!filters.mode}
              onClick={() => patch({ mode: '' })}
            />
            <ModePill
              label={c('islamic')}
              selected={filters.mode === 'ISLAMIC'}
              onClick={() => patch({ mode: filters.mode === 'ISLAMIC' ? '' : 'ISLAMIC' })}
              icon={<Moon className="h-3 w-3" />}
            />
            <ModePill
              label={c('general')}
              selected={filters.mode === 'GENERAL'}
              onClick={() => patch({ mode: filters.mode === 'GENERAL' ? '' : 'GENERAL' })}
              icon={<Sparkles className="h-3 w-3" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <GenderChoice
            label={t('lookingBride')}
            selected={filters.gender === 'FEMALE'}
            onClick={() => patch({ gender: filters.gender === 'FEMALE' ? '' : 'FEMALE' })}
            icon={<UserRound className="h-6 w-6 opacity-80" />}
          />
          <GenderChoice
            label={t('lookingGroom')}
            selected={filters.gender === 'MALE'}
            onClick={() => patch({ gender: filters.gender === 'MALE' ? '' : 'MALE' })}
            icon={<UserRound className="h-6 w-6 opacity-80" />}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 md:p-5 space-y-4">
        <FilterField label={t('filterAgeRange')} icon={Heart} hint={t('filterAgeHint')}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={18}
              max={80}
              className={cn('text-center', filterInputClass)}
              value={filters.ageMin}
              onChange={e => patch({ ageMin: e.target.value })}
            />
            <span className="text-sm text-muted-foreground shrink-0">{t('ageTo')}</span>
            <Input
              type="number"
              min={18}
              max={80}
              className={cn('text-center', filterInputClass)}
              value={filters.ageMax}
              onChange={e => patch({ ageMax: e.target.value })}
            />
            <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
              {t('years')}
            </span>
          </div>
        </FilterField>

        <FilterField label={t('filterLocation')} icon={MapPin}>
          <LocationPicker
            variant="filter"
            divisionId={filters.divisionId}
            districtId={filters.districtId}
            onDivisionChange={id => patch({ divisionId: id, districtId: null, upazilaId: null })}
            onDistrictChange={id => patch({ districtId: id, upazilaId: null })}
            showCountry={false}
            showUpazila={false}
          />
        </FilterField>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowAllFilters(v => !v)}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
            showAllFilters
              ? 'border-primary/40 bg-primary/5 text-primary'
              : 'border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5',
          )}
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {showAllFilters ? t('hideAllFilters') : t('allFilters')}
            {!showAllFilters && advancedCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                {advancedCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              showAllFilters && 'rotate-180',
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-300 ease-out',
            showAllFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 md:p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FilterField label={t('filterMarital')} icon={Heart}>
                  <EnumFilterSelect
                    category="maritalStatus"
                    value={filters.maritalStatus}
                    onChange={v => patch({ maritalStatus: v })}
                    placeholder={t('filterMarital')}
                  />
                </FilterField>
                <FilterField label={t('filterProfession')} icon={BookOpen}>
                  <EnumFilterSelect
                    category="profession"
                    value={filters.professionKey}
                    onChange={v => patch({ professionKey: v })}
                    placeholder={t('filterProfession')}
                  />
                </FilterField>
                <FilterField label={t('filterEducation')}>
                  <EnumFilterSelect
                    category="educationLevel"
                    value={filters.educationLevel}
                    onChange={v => patch({ educationLevel: v })}
                    placeholder={t('filterEducation')}
                  />
                </FilterField>
                <FilterField label={t('filterReligion')}>
                  <EnumFilterSelect
                    category="religion"
                    value={filters.religion}
                    onChange={v => patch({ religion: v })}
                    placeholder={t('filterReligion')}
                  />
                </FilterField>
              </div>

              <FilterField label={t('filterLocationAdvanced')} icon={MapPin}>
                <LocationPicker
                  variant="filter"
                  countryId={filters.countryId}
                  divisionId={filters.divisionId}
                  districtId={filters.districtId}
                  upazilaId={filters.upazilaId}
                  onCountryChange={id => patch({ countryId: id })}
                  onDivisionChange={id =>
                    patch({ divisionId: id, districtId: null, upazilaId: null })
                  }
                  onDistrictChange={id => patch({ districtId: id, upazilaId: null })}
                  onUpazilaChange={id => patch({ upazilaId: id })}
                />
              </FilterField>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full h-12 rounded-full text-base font-semibold gap-2 shadow-lg shadow-primary/20"
      >
        <Search className="h-5 w-5" />
        {loading ? c('loading') : t('searchSubmit')}
      </Button>
    </form>
  );
}
