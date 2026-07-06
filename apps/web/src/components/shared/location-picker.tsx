'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { metaApi } from '@/lib/api/endpoints';
import type { LocationItem } from '@/types/api';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  countryId?: number | null;
  divisionId?: number | null;
  districtId?: number | null;
  upazilaId?: number | null;
  onCountryChange?: (id: number | null) => void;
  onDivisionChange: (id: number | null) => void;
  onDistrictChange: (id: number | null) => void;
  onUpazilaChange?: (id: number | null) => void;
  className?: string;
  showCountry?: boolean;
  showUpazila?: boolean;
  variant?: 'default' | 'filter';
}

export function LocationPicker({
  countryId,
  divisionId,
  districtId,
  upazilaId,
  onCountryChange,
  onDivisionChange,
  onDistrictChange,
  onUpazilaChange,
  className,
  showCountry = true,
  showUpazila = true,
  variant = 'default',
}: LocationPickerProps) {
  const locale = useLocale();
  const t = useTranslations('search');
  const [countries, setCountries] = useState<LocationItem[]>([]);
  const [divisions, setDivisions] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [upazilas, setUpazilas] = useState<LocationItem[]>([]);

  const name = (item: LocationItem) => (locale === 'bn' ? item.nameBn || item.nameEn : item.nameEn);

  useEffect(() => {
    if (!showCountry) return;
    metaApi
      .getLocations('COUNTRY')
      .then(setCountries)
      .catch(() => setCountries([]));
  }, [showCountry]);

  useEffect(() => {
    metaApi
      .getLocations('DIVISION')
      .then(setDivisions)
      .catch(() => setDivisions([]));
  }, []);

  useEffect(() => {
    if (!divisionId) {
      setDistricts([]);
      return;
    }
    metaApi
      .getLocations('DISTRICT', divisionId)
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, [divisionId]);

  useEffect(() => {
    if (!showUpazila || !districtId) {
      setUpazilas([]);
      return;
    }
    metaApi
      .getLocations('UPAZILA', districtId)
      .then(setUpazilas)
      .catch(() => setUpazilas([]));
  }, [districtId, showUpazila]);

  const selectClass =
    variant === 'filter'
      ? 'flex h-11 w-full rounded-xl border border-border/70 bg-background/80 px-3.5 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed'
      : 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {showCountry && (
        <div className="space-y-2 sm:col-span-2">
          <Label>{t('country')}</Label>
          <select
            className={selectClass}
            value={countryId ?? ''}
            onChange={e => onCountryChange?.(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">{t('selectCountry')}</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>
                {name(c)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('division')}</Label>
        <select
          className={selectClass}
          value={divisionId ?? ''}
          onChange={e => {
            const id = e.target.value ? Number(e.target.value) : null;
            onDivisionChange(id);
            onDistrictChange(null);
            onUpazilaChange?.(null);
          }}
        >
          <option value="">{t('selectDivision')}</option>
          {divisions.map(d => (
            <option key={d.id} value={d.id}>
              {name(d)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>{t('district')}</Label>
        <select
          className={selectClass}
          value={districtId ?? ''}
          onChange={e => {
            const id = e.target.value ? Number(e.target.value) : null;
            onDistrictChange(id);
            onUpazilaChange?.(null);
          }}
          disabled={!divisionId}
        >
          <option value="">{t('selectDistrict')}</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>
              {name(d)}
            </option>
          ))}
        </select>
      </div>

      {showUpazila && (
        <div className="space-y-2 sm:col-span-2">
          <Label>{t('thana')}</Label>
          <select
            className={selectClass}
            value={upazilaId ?? ''}
            onChange={e => onUpazilaChange?.(e.target.value ? Number(e.target.value) : null)}
            disabled={!districtId}
          >
            <option value="">{t('selectThana')}</option>
            {upazilas.map(u => (
              <option key={u.id} value={u.id}>
                {name(u)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
