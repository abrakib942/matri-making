'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface MatchDimension {
  key: string;
  score: number;
  label?: string;
}

interface Props {
  mandatoryPercent: number;
  overallPercent?: number;
  mandatoryBreakdown: MatchDimension[];
  overallBreakdown?: MatchDimension[];
  className?: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  salah: 'Religious practice',
  hijab: 'Modesty',
  aqeedah: 'Aqeedah',
  madhhab: 'Madhhab',
  islamicFinance: 'Islamic finance',
  location: 'Location',
  education: 'Education',
  profession: 'Profession',
  lifestyle: 'Lifestyle',
  religionPractice: 'Religious values',
  lifeGoals: 'Life goals',
};

export function MatchBreakdownRing({
  mandatoryPercent,
  overallPercent,
  mandatoryBreakdown,
  overallBreakdown,
  className,
}: Props) {
  const t = useTranslations('match');
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (mandatoryPercent / 100) * c;

  const dimensions = mandatoryBreakdown.length ? mandatoryBreakdown : (overallBreakdown ?? []);

  return (
    <div className={cn('flex flex-col sm:flex-row gap-6 items-center', className)}>
      <div className="relative h-36 w-36 shrink-0">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{mandatoryPercent}%</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {t('mandatory')}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        {overallPercent != null && (
          <p className="text-sm text-muted-foreground">
            {t('overall')}: <span className="font-semibold text-foreground">{overallPercent}%</span>
          </p>
        )}
        <ul className="space-y-2">
          {dimensions.map(d => (
            <li key={d.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {d.label ?? DIMENSION_LABELS[d.key] ?? d.key}
              </span>
              <span className="font-medium tabular-nums">{d.score}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
