'use client';

import { useTranslations } from 'next-intl';

export function PhilosophyStrip() {
  const t = useTranslations('home');
  const words = [t('philosophyTrust'), t('philosophyCompatibility'), t('philosophyPrivacy')];

  return (
    <section className="border-y border-border/60 bg-background">
      <div className="container py-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
          {words.map((word, i) => (
            <div key={word} className="flex items-center gap-6 sm:gap-12">
              <span className="text-sm md:text-base font-medium tracking-wide text-foreground/80">
                {word}
              </span>
              {i < words.length - 1 && (
                <span className="hidden sm:inline text-muted-foreground/40" aria-hidden>
                  ·
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
