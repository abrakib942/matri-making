'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { contentApi } from '@/lib/api/endpoints';
import { Skeleton } from '@/components/ui/skeleton';

interface CmsPage {
  titleEn?: string;
  titleBn?: string;
  contentEn?: string;
  contentBn?: string;
}

export default function AboutPage() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    contentApi
      .cmsPage('about')
      .then(data => setPage(data as CmsPage))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const title = locale === 'bn' ? page?.titleBn || page?.titleEn : page?.titleEn;
  const content = locale === 'bn' ? page?.contentBn || page?.contentEn : page?.contentEn;

  return (
    <div className="container py-12 md:py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">{loading ? t('about') : (title ?? t('about'))}</h1>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ) : error || !page ? (
        <p className="text-muted-foreground">Page content is not available yet.</p>
      ) : (
        <article className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground">
          {content}
        </article>
      )}
    </div>
  );
}
