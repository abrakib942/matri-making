'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Moon, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export function EditorialHero() {
  const t = useTranslations('home');
  const c = useTranslations('common');
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion();

  const startHref = isAuthenticated ? '/choose-mode' : '/register';

  return (
    <section className="mesh-hero relative overflow-hidden">
      <div className="container py-20 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <p className="text-label">{t('heroEyebrow')}</p>
            <h1 className="text-display font-bengali text-balance">
              {t('heroTitleNew')}
            </h1>
            <p className="text-body max-w-xl text-lg">{t('heroSubtitleNew')}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base gap-2">
                <Link href={startHref}>
                  {t('heroCtaPrimary')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full h-12">
                <Link href="/about">{c('learnMore')}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="glass-panel p-6 md:p-8 space-y-5">
              <p className="text-label">{t('pathLabel')}</p>
              <p className="text-h3 text-foreground">{t('pathTitle')}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('pathDesc')}</p>

              <div className="grid gap-3 pt-2">
                <Link
                  href="/islamic"
                  className="group flex items-center gap-4 rounded-xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Moon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{c('islamic')}</p>
                    <p className="text-xs text-muted-foreground truncate">{t('pathIslamicHint')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </Link>
                <Link
                  href="/general"
                  className="group flex items-center gap-4 rounded-xl border border-border/60 bg-background/60 p-4 transition-colors hover:border-accent/30 hover:bg-accent/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{c('general')}</p>
                    <p className="text-xs text-muted-foreground truncate">{t('pathGeneralHint')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-accent transition-colors" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
