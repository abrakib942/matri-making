'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BiodataCard } from '@/components/profile/biodata-card';
import { BiodataCardSkeleton } from '@/components/profile/biodata-card-skeleton';
import { searchApi } from '@/lib/api/endpoints';
import type { BiodataCard as BiodataCardType } from '@/types/api';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Section, SectionHeader } from '@/components/ui/section';

interface ProfileCarouselProps {
  titleKey: string;
  searchParams: Record<string, unknown>;
  viewAllHref?: string;
}

export function ProfileCarousel({
  titleKey,
  searchParams,
  viewAllHref = '/search',
}: ProfileCarouselProps) {
  const t = useTranslations('home');
  const c = useTranslations('common');
  const [profiles, setProfiles] = useState<BiodataCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchApi
      .search({ limit: 8, ...searchParams })
      .then(res => setProfiles((res.items ?? []) as BiodataCardType[]))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <Section spacing="md">
      <div className="container">
        <SectionHeader
          title={t(titleKey)}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={viewAllHref}>{c('viewAll')}</Link>
            </Button>
          }
        />
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <BiodataCardSkeleton key={i} />
            ))}
          </div>
        ) : profiles.length === 0 ? null : (
          <Carousel opts={{ align: 'start', loop: false }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {profiles.map(p => (
                <CarouselItem
                  key={p.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
                >
                  <BiodataCard profile={p} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
            <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
          </Carousel>
        )}
      </div>
    </Section>
  );
}

export function FeaturedCarousel() {
  return (
    <ProfileCarousel titleKey="featuredTitle" searchParams={{ sortBy: 'lastActive', limit: 8 }} />
  );
}

export function TrendingCarousel() {
  return (
    <ProfileCarousel
      titleKey="trendingTitle"
      searchParams={{ sortBy: 'lastActive', recentlyActiveDays: 1, limit: 8 }}
    />
  );
}

export function RecentCarousel() {
  return <ProfileCarousel titleKey="recentTitle" searchParams={{ sortBy: 'newest', limit: 8 }} />;
}
