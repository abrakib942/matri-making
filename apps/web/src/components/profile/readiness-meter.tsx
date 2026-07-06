'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReadinessMeterProps {
  percent: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'bar' | 'ring';
}

export function ReadinessMeter({
  percent,
  className,
  showLabel = true,
  variant = 'bar',
}: ReadinessMeterProps) {
  const t = useTranslations('dashboard');
  const clamped = Math.min(100, Math.max(0, percent));

  if (variant === 'ring') {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            {clamped}%
          </span>
        </div>
        {showLabel && <span className="text-sm text-muted-foreground">{t('readiness')}</span>}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('readiness')}</span>
          <span className="font-medium">{clamped}%</span>
        </div>
      )}
      <Progress value={clamped} />
    </div>
  );
}
