'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { metaApi, paymentApi } from '@/lib/api/endpoints';
import type { ApiResponse, CreditPackageItem, CreditLedgerEntry, WalletData } from '@/types/api';

interface Order {
  id: number;
  type: string;
  itemKey: string;
  amountPaisa: number;
  status: string;
  createdAt?: string;
}

function formatBdt(paisa: number, locale: string) {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(paisa / 100);
}

function formatLedgerType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function WalletPage() {
  const nav = useTranslations('nav');
  const w = useTranslations('wallet');
  const c = useTranslations('common');
  const locale = useLocale();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [packages, setPackages] = useState<CreditPackageItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([paymentApi.wallet(), metaApi.getPlans(), paymentApi.listOrders()])
      .then(([walletData, plans, o]) => {
        setWallet(walletData);
        setPackages(plans.creditPackages ?? []);
        const list = Array.isArray(o) ? o : ((o as { items?: Order[] })?.items ?? []);
        setOrders(list);
      })
      .catch(() => {
        setWallet(null);
        setPackages([]);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const buyPackage = async (itemKey: string) => {
    setOrdering(itemKey);
    try {
      const res = await paymentApi.createOrder({ type: 'CREDIT_PACKAGE', itemKey });
      if (res.gatewayUrl) {
        window.location.href = res.gatewayUrl;
      } else {
        toast.error('Payment gateway unavailable');
      }
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as ApiResponse).message)
          : 'Failed to create order';
      toast.error(message);
    } finally {
      setOrdering(null);
    }
  };

  const entries: CreditLedgerEntry[] = wallet?.entries ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{nav('wallet')}</h1>

      {loading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{w('balanceTitle')}</CardTitle>
              <CardDescription>{w('balanceDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{wallet?.balance ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{w('packagesTitle')}</CardTitle>
              <CardDescription>{w('packagesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <p className="text-sm text-muted-foreground">{w('noPackages')}</p>
              ) : (
                <ul className="divide-y">
                  {packages.map(pkg => {
                    const name = locale === 'bn' ? pkg.nameBn || pkg.nameEn : pkg.nameEn;
                    return (
                      <li key={pkg.key} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-muted-foreground">
                            {w('creditsCount', { count: pkg.credits })} ·{' '}
                            {formatBdt(pkg.pricePaisa, locale)}
                          </p>
                        </div>
                        <Button size="sm" disabled={!!ordering} onClick={() => buyPackage(pkg.key)}>
                          {ordering === pkg.key ? c('loading') : w('buyCredits')}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{w('ledgerTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{w('noLedger')}</p>
              ) : (
                <ul className="divide-y">
                  {entries.map(entry => (
                    <li key={entry.id} className="py-3 flex justify-between text-sm gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">{formatLedgerType(entry.type)}</p>
                        {entry.note && (
                          <p className="text-muted-foreground truncate">{entry.note}</p>
                        )}
                      </div>
                      <span
                        className={
                          entry.amount >= 0 ? 'text-emerald-600 font-medium' : 'text-foreground'
                        }
                      >
                        {entry.amount >= 0 ? '+' : ''}
                        {entry.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{w('ordersTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">{w('noOrders')}</p>
              ) : (
                <ul className="divide-y">
                  {orders.map(order => (
                    <li key={order.id} className="py-3 flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{order.itemKey}</p>
                        <p className="text-muted-foreground">
                          {order.type} · {order.status}
                        </p>
                      </div>
                      <span>{formatBdt(order.amountPaisa, locale)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
