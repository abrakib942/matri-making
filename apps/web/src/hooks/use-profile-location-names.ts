'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { metaApi } from '@/lib/api/endpoints';
import type { ProfileDetail } from '@/types/profile';

export function useProfileLocationNames(profile: ProfileDetail | null): Record<number, string> {
  const locale = useLocale();
  const [names, setNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!profile) return;

    const ids = [
      profile.countryId,
      profile.divisionId,
      profile.districtId,
      profile.upazilaId,
    ].filter((id): id is number => id != null);

    const prefIds = [
      ...(profile.preference?.divisionIds ?? []),
      ...(profile.preference?.districtIds ?? []),
    ];

    const allIds = [...new Set([...ids, ...prefIds])];
    if (!allIds.length) {
      setNames({});
      return;
    }

    let cancelled = false;
    metaApi
      .getLocations()
      .then(locations => {
        if (cancelled) return;
        const map: Record<number, string> = {};
        for (const loc of locations) {
          map[loc.id] = locale === 'bn' ? loc.nameBn || loc.nameEn : loc.nameEn;
        }
        setNames(map);
      })
      .catch(() => setNames({}));

    return () => {
      cancelled = true;
    };
  }, [profile, locale]);

  return names;
}
