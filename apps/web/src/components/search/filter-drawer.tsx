'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface FilterDrawerProps {
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

export function FilterDrawer({ children, onApply, onReset, className }: FilterDrawerProps) {
  const t = useTranslations('search');
  const c = useTranslations('common');
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  const panel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t('filters')}</h2>
        {onReset && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            {t('resetFilters')}
          </Button>
        )}
      </div>
      {children}
      {onApply && (
        <Button type="button" className="w-full lg:hidden" onClick={handleApply}>
          {c('continue')}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <aside className={cn('hidden lg:block w-[280px] shrink-0', className)}>
        <div className="sticky top-20 rounded-xl border bg-card p-5 shadow-sm">{panel}</div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" className="gap-2 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            {t('filters')}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t('filters')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{panel}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
