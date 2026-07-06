'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentApi } from '@/lib/api/endpoints';

interface WalletData {
  balancePaisa?: number;
  credits?: number;
}

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

export default function WalletPage() {
  const nav = useTranslations('nav');
  const locale = useLocale();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([paymentApi.wallet(), paymentApi.listOrders()])
      .then(([w, o]) => {
        setWallet(w as WalletData);
        const list = Array.isArray(o) ? o : (o as { items?: Order[] })?.items ?? [];
        setOrders(list);
      })
      .catch(() => {
        setWallet(null);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{nav('wallet')}</h1>

      {loading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Wallet balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatBdt(wallet?.balancePaisa ?? 0, locale)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Unlock credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{wallet?.credits ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order history</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <ul className="divide-y">
                  {orders.map(order => (
                    <li key={order.id} className="py-3 flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{order.itemKey}</p>
                        <p className="text-muted-foreground">{order.type} · {order.status}</p>
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
