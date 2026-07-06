'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const stepKeys = ['journey1', 'journey2', 'journey3', 'journey4'] as const;

export function JourneyNarrative() {
  const t = useTranslations('home');
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28 border-y border-border/60">
      <div className="container max-w-3xl">
        <p className="text-label text-center mb-4">{t('journeyEyebrow')}</p>
        <h2 className="text-h2 text-center mb-16 text-balance">{t('journeyTitle')}</h2>

        <div className="relative space-y-0">
          <div
            className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"
            aria-hidden
          />

          {stepKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative flex gap-8 pb-12 last:pb-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-sm font-semibold text-primary z-10">
                {i + 1}
              </div>
              <div className="pt-1 space-y-2">
                <h3 className="text-lg font-medium">{t(`${key}Title`)}</h3>
                <p className="text-body text-sm">{t(`${key}Desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
