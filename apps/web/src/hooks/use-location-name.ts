'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { metaApi } from '@/lib/api/endpoints';
import type { LocationItem } from '@/types/api';

const cache = new Map<number, LocationItem>();

export function useLocationName(locationId?: number | null): string | null {
  const locale = useLocale();
  const [name, setName] = useState<string | null>(() => {
    if (!locationId) return null;
    const cached = cache.get(locationId);
    if (!cached) return null;
    return locale === 'bn' ? cached.nameBn || cached.nameEn : cached.nameEn;
  });

  useEffect(() => {
    if (!locationId) {
      setName(null);
      return;
    }

    const cached = cache.get(locationId);
    if (cached) {
      setName(locale === 'bn' ? cached.nameBn || cached.nameEn : cached.nameEn);
      return;
    }

    let cancelled = false;
    metaApi
      .getLocations()
      .then(locations => {
        locations.forEach(loc => cache.set(loc.id, loc));
        const loc = cache.get(locationId);
        if (!cancelled && loc) {
          setName(locale === 'bn' ? loc.nameBn || loc.nameEn : loc.nameEn);
        }
      })
      .catch(() => {
        if (!cancelled) setName(null);
      });

    return () => {
      cancelled = true;
    };
  }, [locationId, locale]);

  return name;
}
