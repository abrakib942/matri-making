'use client';

import { Check, Heart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocationName } from '@/hooks/use-location-name';
import { useEnums } from '@/lib/providers/enum-provider';
import { Link } from '@/i18n/navigation';
import { interestApi } from '@/lib/api/endpoints';
import { formatBnNumber } from '@/lib/format-bn-number';
import type { BiodataCard as BiodataCardType } from '@/types/api';
import { cn } from '@/lib/utils';

interface Props {
  profile: BiodataCardType;
  className?: string;
  showCompatibility?: boolean;
  showFavourite?: boolean;
  variant?: 'vertical' | 'horizontal';
}

function CompatibilityRing({ percent }: { percent: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {percent}%
      </span>
    </div>
  );
}

export function BiodataCard({
  profile,
  className,
  showCompatibility,
  showFavourite = true,
  variant = 'vertical',
}: Props) {
  const t = useTranslations('search');
  const locale = useLocale();
  const { label } = useEnums();
  const districtName = useLocationName(profile.districtId);
  const [favourited, setFavourited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const flags = (profile.greenFlags as string[] | undefined)?.slice(0, 2) ?? [];
  const essence = [
    label('profession', profile.professionKey ?? undefined),
    label('educationLevel', profile.educationLevel ?? undefined),
  ]
    .filter(Boolean)
    .join(' · ');

  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      await interestApi.favourite(profile.id);
      setFavourited(true);
    } catch {
      /* ignore */
    } finally {
      setFavLoading(false);
    }
  };

  const avatar = (
    <div className="relative shrink-0">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-secondary to-accent/10 flex items-center justify-center',
          variant === 'horizontal' ? 'h-20 w-20 md:h-24 md:w-24' : 'aspect-[3/4] w-full',
        )}
      >
        {profile.photoUrl ? (
          <Image src={profile.photoUrl} alt="" fill className="object-cover" unoptimized />
        ) : (
          <span className="text-2xl font-semibold text-primary/40">
            {profile.biodataNo.slice(-2)}
          </span>
        )}
      </div>
      {showCompatibility && profile.compatibilityPercent != null && variant === 'horizontal' && (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 shadow-sm">
          {profile.compatibilityPercent}%
        </span>
      )}
    </div>
  );

  const content = (
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label">{profile.biodataNo}</p>
          <p className="font-medium text-foreground mt-0.5">
            {label('gender', profile.gender)}
            {districtName && (
              <span className="text-muted-foreground font-normal"> · {districtName}</span>
            )}
          </p>
        </div>
        {showFavourite && (
          <button
            type="button"
            onClick={handleFavourite}
            disabled={favLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t('favourite')}
          >
            <Heart
              className={cn('h-4 w-4', favourited ? 'fill-accent text-accent' : 'text-muted-foreground')}
            />
          </button>
        )}
      </div>

      {essence && <p className="text-sm text-muted-foreground line-clamp-1">{essence}</p>}

      <p className="text-sm text-muted-foreground">
        {formatBnNumber(profile.age, locale)} {t('years')}
        {profile.mode === 'ISLAMIC' && (
          <span className="ml-2 text-primary/80">· {t('islamicBiodata')}</span>
        )}
      </p>

      {flags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {flags.map(flag => (
            <span
              key={flag}
              className="inline-flex items-center gap-1 text-xs text-primary/80 bg-primary/5 rounded-full px-2.5 py-0.5"
            >
              <Check className="h-3 w-3" aria-hidden />
              {flag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {showCompatibility && profile.compatibilityPercent != null && variant === 'vertical' && (
        <div className="pt-2">
          <CompatibilityRing percent={profile.compatibilityPercent} />
        </div>
      )}

      <Button asChild variant="ghost" size="sm" className="rounded-full -ml-3 mt-1 text-primary">
        <Link href={`/profiles/${profile.id}`}>{t('viewBiodata')} →</Link>
      </Button>
    </div>
  );

  if (variant === 'horizontal') {
    return (
      <article className={cn('intro-card flex gap-5 p-5 md:p-6', className)}>
        {avatar}
        {content}
      </article>
    );
  }

  return (
    <div className={cn('intro-card overflow-hidden', className)}>
      <div className="p-4 pb-0">{avatar}</div>
      <div className="p-4 pt-3">{content}</div>
    </div>
  );
}
