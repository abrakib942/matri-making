'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { contentApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface Story {
  id: number;
  title: { en?: string; bn?: string };
  content: { en?: string; bn?: string };
}

export function SuccessStoriesSection() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    contentApi
      .successStories()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : ((data as { items?: Story[] })?.items ?? []);
        setStories(list.slice(0, 3));
      })
      .catch(() => setStories([]));
  }, []);

  if (stories.length === 0) return null;

  const lang = locale === 'bn' ? 'bn' : 'en';

  return (
    <section className="container py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{t('successStories')}</h2>
        <Button asChild variant="ghost">
          <Link href="/success-stories">View all</Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {stories.map(story => (
          <Card key={story.id}>
            <CardHeader>
              <CardTitle className="text-lg">{story.title?.[lang] ?? story.title?.en}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {story.content?.[lang] ?? story.content?.en}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
