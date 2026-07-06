'use client';

import { Check, Moon, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  className?: string;
  onSelect?: (mode: 'ISLAMIC' | 'GENERAL') => void;
  selected?: 'ISLAMIC' | 'GENERAL' | null;
}

export function ModeSelector({ className, onSelect, selected }: ModeSelectorProps) {
  const t = useTranslations('mode');
  const c = useTranslations('common');

  const modes = [
    {
      id: 'ISLAMIC' as const,
      title: c('islamic'),
      desc: t('islamicDesc'),
      icon: Moon,
      href: '/onboarding?mode=ISLAMIC',
      features: [t('islamicFeature1'), t('islamicFeature2'), t('islamicFeature3')],
      accent: 'from-primary/90 to-primary',
    },
    {
      id: 'GENERAL' as const,
      title: c('general'),
      desc: t('generalDesc'),
      icon: Sparkles,
      href: '/onboarding?mode=GENERAL',
      features: [t('generalFeature1'), t('generalFeature2'), t('generalFeature3')],
      accent: 'from-accent/90 to-accent',
    },
  ];

  return (
    <div className={cn('grid md:grid-cols-2 gap-4 max-w-4xl mx-auto', className)}>
      {modes.map(mode => {
        const Icon = mode.icon;
        const isSelected = selected === mode.id;

        return (
          <div
            key={mode.id}
            className={cn(
              'glass-panel p-6 md:p-8 space-y-5 cursor-pointer transition-all',
              isSelected && 'ring-2 ring-primary/40',
            )}
            onClick={() => onSelect?.(mode.id)}
          >
            <div
              className={cn(
                'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white',
                mode.accent,
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{mode.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{mode.desc}</p>
            </div>
            <ul className="space-y-2">
              {mode.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="w-full rounded-full"
              variant={isSelected ? 'default' : 'outline'}
            >
              <Link href={onSelect ? '#' : mode.href} onClick={e => onSelect && e.preventDefault()}>
                {t('continue')}
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
