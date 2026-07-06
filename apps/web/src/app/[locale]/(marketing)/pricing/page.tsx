'use client';

import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { metaApi } from '@/lib/api/endpoints';
import type { PlanItem } from '@/types/api';

function formatPrice(paisa: number, locale: string) {
  const bdt = paisa / 100;
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(bdt);
}

function PlanCard({ plan, locale }: { plan: PlanItem; locale: string }) {
  const c = useTranslations('common');
  const name = locale === 'bn' ? plan.nameBn || plan.nameEn : plan.nameEn;
  const desc = locale === 'bn' ? plan.descriptionBn || plan.descriptionEn : plan.descriptionEn;
  const features = Object.entries(plan.features ?? {}).filter(([, v]) => v);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{desc}</CardDescription>
        <p className="text-3xl font-bold pt-2">
          {formatPrice(plan.pricePaisa, locale)}
          {plan.interval && plan.interval !== 'ONE_TIME' && (
            <span className="text-sm font-normal text-muted-foreground">/{plan.interval.toLowerCase()}</span>
          )}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm">
          {features.map(([key, val]) => (
            <li key={key} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{typeof val === 'string' ? val : key.replace(/_/g, ' ')}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/register">{c('getStarted')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [packages, setPackages] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metaApi
      .getPlans()
      .then(data => {
        setPlans(data.plans ?? []);
        setPackages(data.packages ?? []);
      })
      .catch(() => {
        setPlans([]);
        setPackages([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-12 md:py-16 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">Start free. Upgrade when you are ready.</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">{t('subscribeTitle')}</h2>
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-center text-muted-foreground">No subscription plans available yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(plan => (
              <PlanCard key={plan.key} plan={plan} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">{t('creditsTitle')}</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <p className="text-center text-muted-foreground">No credit packages available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {packages.map(pkg => (
              <Card key={pkg.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {locale === 'bn' ? pkg.nameBn || pkg.nameEn : pkg.nameEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatPrice(pkg.pricePaisa, locale)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {locale === 'bn' ? pkg.descriptionBn || pkg.descriptionEn : pkg.descriptionEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
