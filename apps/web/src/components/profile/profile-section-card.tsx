'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const ProfileSectionCard = forwardRef<HTMLElement, Props>(function ProfileSectionCard(
  { title, children, className, id },
  ref,
) {
  return (
    <section ref={ref} id={id} className={cn('glass-panel rounded-2xl overflow-hidden', className)}>
      <div className="px-5 py-3.5 border-b border-border/50 bg-secondary/30">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
      </div>
      <dl className="px-5 py-2">{children}</dl>
    </section>
  );
});
