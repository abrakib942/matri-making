'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CompatibilityBadgeProps {
  percent: number;
  className?: string;
  showLabel?: boolean;
}

function tier(percent: number): 'high' | 'medium' | 'low' {
  if (percent >= 75) return 'high';
  if (percent >= 50) return 'medium';
  return 'low';
}

const tierStyles = {
  high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-muted text-muted-foreground',
};

export function CompatibilityBadge({
  percent,
  className,
  showLabel = true,
}: CompatibilityBadgeProps) {
  const t = tier(percent);

  return (
    <Badge className={cn(tierStyles[t], className)} variant="outline">
      {percent}%{showLabel && ' match'}
    </Badge>
  );
}
