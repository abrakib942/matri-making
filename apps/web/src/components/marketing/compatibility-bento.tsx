'use client';

import { Brain, Fingerprint, ShieldCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CompatibilityBento() {
  const t = useTranslations('home');

  const items = [
    {
      icon: Brain,
      title: t('bentoCompatibility'),
      desc: t('bentoCompatibilityDesc'),
      className: 'md:col-span-2',
    },
    {
      icon: Fingerprint,
      title: t('bentoGreenFlags'),
      desc: t('bentoGreenFlagsDesc'),
      className: '',
    },
    { icon: ShieldCheck, title: t('bentoPrivacy'), desc: t('bentoPrivacyDesc'), className: '' },
    {
      icon: Users,
      title: t('bentoFamily'),
      desc: t('bentoFamilyDesc'),
      className: 'md:col-span-2',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-label mb-3">{t('bentoEyebrow')}</p>
          <h2 className="text-h2">{t('bentoTitle')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {items.map(({ icon: Icon, title, desc, className }) => (
            <div key={title} className={`glass-panel p-6 md:p-8 space-y-4 ${className}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-medium text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
