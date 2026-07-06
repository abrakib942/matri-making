'use client';

import { Check, Heart, Moon, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ModeSelector } from '@/components/shared/mode-selector';
import { Link } from '@/i18n/navigation';
import { HowItWorks } from '@/components/marketing/home-sections';

export default function IslamicLandingPage() {
  const t = useTranslations('home');
  const c = useTranslations('common');
  const m = useTranslations('mode');

  const features = [
    { icon: Shield, text: 'No photos by default — privacy first' },
    { icon: Users, text: 'Wali & mahram-friendly family involvement' },
    { icon: Moon, text: 'Deen-first biodata with Islamic details' },
    { icon: Heart, text: 'Compatibility based on values & practice' },
  ];

  return (
    <div>
      <section className="gradient-hero">
        <div className="container py-16 md:py-24 text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm">
            <Moon className="h-4 w-4 text-primary" />
            {c('islamic')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{c('islamic')}</h1>
          <p className="text-lg text-muted-foreground">{m('islamicDesc')}</p>
          <Button asChild size="lg">
            <Link href="/register">{c('getStarted')}</Link>
          </Button>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 rounded-xl border p-4">
              <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />

      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-8">{m('title')}</h2>
        <ModeSelector selected="ISLAMIC" />
        <p className="text-center text-sm text-muted-foreground mt-6 flex items-center justify-center gap-1">
          <Check className="h-4 w-4 text-emerald-600" />
          {t('trustVerified')}
        </p>
      </section>
    </div>
  );
}
