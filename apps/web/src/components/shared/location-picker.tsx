'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { metaApi } from '@/lib/api/endpoints';
import type { LocationItem } from '@/types/api';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  divisionId?: number | null;
  districtId?: number | null;
  onDivisionChange: (id: number | null) => void;
  onDistrictChange: (id: number | null) => void;
  className?: string;
  showUpazila?: boolean;
  upazilaId?: number | null;
  onUpazilaChange?: (id: number | null) => void;
}

export function LocationPicker({
  divisionId,
  districtId,
  onDivisionChange,
  onDistrictChange,
  className,
  showUpazila,
  upazilaId,
  onUpazilaChange,
}: LocationPickerProps) {
  const locale = useLocale();
  const t = useTranslations('search');
  const [divisions, setDivisions] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [upazilas, setUpazilas] = useState<LocationItem[]>([]);

  const name = (item: LocationItem) => (locale === 'bn' ? item.nameBn || item.nameEn : item.nameEn);

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
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
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
          <Label>{t('upazila')}</Label>
          <select
            className={selectClass}
            value={upazilaId ?? ''}
            onChange={e => onUpazilaChange?.(e.target.value ? Number(e.target.value) : null)}
            disabled={!districtId}
          >
            <option value="">{t('selectUpazila')}</option>
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
