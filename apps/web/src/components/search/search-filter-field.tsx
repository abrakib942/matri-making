'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterFieldProps {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  hint?: string;
}

export function FilterField({ label, icon: Icon, children, className, hint }: FilterFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export const filterSelectClass =
  'flex h-11 w-full rounded-xl border border-border/70 bg-background/80 px-3.5 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed';

export const filterInputClass =
  'h-11 rounded-xl border-border/70 bg-background/80 shadow-sm focus-visible:ring-primary/30';

interface GenderChoiceProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export function GenderChoice({ label, selected, onClick, icon }: GenderChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition-all duration-200',
        selected
          ? 'border-primary bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]'
          : 'border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground',
      )}
    >
      {icon}
      <span>{label}</span>
      {selected && (
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" aria-hidden />
      )}
    </button>
  );
}

interface ModePillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export function ModePill({ label, selected, onClick, icon }: ModePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
        selected
          ? 'bg-foreground text-background shadow-sm'
          : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
