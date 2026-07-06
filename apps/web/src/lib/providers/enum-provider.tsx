'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { metaApi } from '@/lib/api/endpoints';
import type { EnumCatalog } from '@/types/api';

interface EnumContextValue {
  catalog: EnumCatalog;
  label: (category: string, value?: string | null) => string;
  isLoading: boolean;
}

const EnumContext = createContext<EnumContextValue | null>(null);

export function EnumProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [catalog, setCatalog] = useState<EnumCatalog>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    metaApi
      .getEnums(locale)
      .then(setCatalog)
      .catch(() => setCatalog({}))
      .finally(() => setIsLoading(false));
  }, [locale]);

  const label = useCallback(
    (category: string, value?: string | null) => {
      if (!value) return '';
      const entry = catalog[category]?.find(e => e.value === value);
      return entry?.label ?? value;
    },
    [catalog],
  );

  const value = useMemo(() => ({ catalog, label, isLoading }), [catalog, label, isLoading]);

  return <EnumContext.Provider value={value}>{children}</EnumContext.Provider>;
}

export function useEnums() {
  const ctx = useContext(EnumContext);
  if (!ctx) throw new Error('useEnums must be used within EnumProvider');
  return ctx;
}
