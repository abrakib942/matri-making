'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { contentApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Story {
  id: number;
  titleEn?: string;
  titleBn?: string;
  contentEn?: string;
  contentBn?: string;
  imageUrl?: string | null;
  title?: { en?: string; bn?: string };
  content?: { en?: string; bn?: string };
}

function storyTitle(story: Story, lang: 'en' | 'bn') {
  return (
    story.title?.[lang] ?? (lang === 'bn' ? story.titleBn : story.titleEn) ?? story.titleEn ?? ''
  );
}

function storyContent(story: Story, lang: 'en' | 'bn') {
  return (
    story.content?.[lang] ??
    (lang === 'bn' ? story.contentBn : story.contentEn) ??
    story.contentEn ??
    ''
  );
}

export default function SuccessStoriesPage() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const lang = locale === 'bn' ? 'bn' : 'en';
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi
      .successStories()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : ((data as { items?: Story[] })?.items ?? []);
        setStories(list);
      })
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-4xl font-bold text-center mb-12">{t('successStories')}</h1>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <p className="text-center text-muted-foreground">No success stories yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <Card key={story.id} className="overflow-hidden">
              {story.imageUrl && (
                <div className="relative aspect-video bg-muted">
                  <Image src={story.imageUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{storyTitle(story, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {storyContent(story, lang)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
