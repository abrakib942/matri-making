'use client';

import { useRouter } from '@/i18n/navigation';
import { BiodataSearchForm } from '@/components/search/biodata-search-form';
import {
  biodataFiltersToQuery,
  type BiodataSearchFilters,
} from '@/lib/search/biodata-search-filters';

interface HeroSearchProps {
  embedded?: boolean;
}

export function HeroSearch({ embedded = true }: HeroSearchProps) {
  const router = useRouter();

  const handleSubmit = (filters: BiodataSearchFilters) => {
    const qs = biodataFiltersToQuery(filters);
    router.push(`/search${qs ? `?${qs}` : ''}`);
  };

  return <BiodataSearchForm onSubmit={handleSubmit} />;
}
