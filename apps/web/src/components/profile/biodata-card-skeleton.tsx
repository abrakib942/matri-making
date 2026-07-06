import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'vertical' | 'horizontal';
}

export function BiodataCardSkeleton({ variant = 'vertical' }: Props) {
  if (variant === 'horizontal') {
    return (
      <div className="intro-card flex gap-5 p-5 md:p-6">
        <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-xs" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="intro-card overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
