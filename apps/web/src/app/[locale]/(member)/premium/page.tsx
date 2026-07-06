'use client';

import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { metaApi, paymentApi } from '@/lib/api/endpoints';
import type { PlanItem } from '@/types/api';

function formatPrice(paisa: number, locale: string) {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(paisa / 100);
}

export default function PremiumPage() {
  const t = useTranslations('pricing');
  const c = useTranslations('common');
  const locale = useLocale();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState<string | null>(null);

  useEffect(() => {
    metaApi
      .getPlans()
      .then(data => setPlans(data.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const subscribe = async (itemKey: string) => {
    setOrdering(itemKey);
    try {
      const res = (await paymentApi.createOrder({ type: 'SUBSCRIPTION', itemKey })) as {
        gatewayUrl?: string | null;
      };
      if (res.gatewayUrl) {
        window.location.href = res.gatewayUrl;
      }
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{c('premium')}</h1>
      <p className="text-muted-foreground">{t('subscribeTitle')}</p>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-muted-foreground">No plans available.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const name = locale === 'bn' ? plan.nameBn || plan.nameEn : plan.nameEn;
            const desc =
              locale === 'bn' ? plan.descriptionBn || plan.descriptionEn : plan.descriptionEn;
            const features = Object.entries(plan.features ?? {}).filter(([, v]) => v);

            return (
              <Card key={plan.key} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                  <p className="text-2xl font-bold pt-2">{formatPrice(plan.pricePaisa, locale)}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    {features.map(([key, val]) => (
                      <li key={key} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        {typeof val === 'string' ? val : key.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={ordering === plan.key}
                    onClick={() => subscribe(plan.key)}
                  >
                    {ordering === plan.key ? c('loading') : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
