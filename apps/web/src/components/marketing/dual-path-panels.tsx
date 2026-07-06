'use client';

import { Moon, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function DualPathPanels() {
  const t = useTranslations('home');
  const c = useTranslations('common');

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-label mb-3">{t('dualPathEyebrow')}</p>
          <h2 className="text-h2">{t('dualPathTitle')}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Link
            href="/islamic"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-8 md:p-10 text-primary-foreground min-h-[280px] flex flex-col justify-between"
          >
            <Moon className="h-8 w-8 opacity-80" />
            <div>
              <h3 className="text-2xl font-semibold mb-2">{c('islamic')}</h3>
              <p className="text-sm text-primary-foreground/80 leading-relaxed max-w-xs">
                {t('dualPathIslamic')}
              </p>
            </div>
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {t('dualPathExplore')} →
            </span>
          </Link>

          <Link
            href="/general"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/90 to-accent p-8 md:p-10 text-accent-foreground min-h-[280px] flex flex-col justify-between"
          >
            <Sparkles className="h-8 w-8 opacity-80" />
            <div>
              <h3 className="text-2xl font-semibold mb-2">{c('general')}</h3>
              <p className="text-sm text-accent-foreground/85 leading-relaxed max-w-xs">
                {t('dualPathGeneral')}
              </p>
            </div>
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {t('dualPathExplore')} →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SoftCta() {
  const t = useTranslations('home');
  const c = useTranslations('common');

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="glass-panel max-w-3xl mx-auto text-center p-10 md:p-14 space-y-6">
          <h2 className="text-h2 text-balance">{t('softCtaTitle')}</h2>
          <p className="text-body max-w-md mx-auto">{t('softCtaDesc')}</p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/register">{c('getStarted')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
