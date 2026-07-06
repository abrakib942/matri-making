'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useEffect, useState } from 'react';
import { EnumSelect } from '@/components/shared/enum-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { verificationApi } from '@/lib/api/endpoints';

interface Verification {
  id: number;
  type: string;
  status: string;
  evidenceUrl?: string;
  createdAt?: string;
}

export default function VerificationsPage() {
  const t = useTranslations('member');
  const c = useTranslations('common');
  const [items, setItems] = useState<Verification[]>([]);
  const [type, setType] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    verificationApi
      .list()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { items?: Verification[] })?.items ?? [];
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setError('');
    setSubmitting(true);
    try {
      await verificationApi.submit({ type, evidenceUrl: evidenceUrl || undefined });
      setType('');
      setEvidenceUrl('');
      load();
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t('verifications')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submit verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <EnumSelect category="verificationType" label="Type" value={type} onChange={setType} required />
            <div className="space-y-2">
              <Label>Evidence URL (optional)</Label>
              <Input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} placeholder="https://..." />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting || !type}>
              {submitting ? c('loading') : c('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 rounded-lg" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verifications submitted yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map(v => (
                <li key={v.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                  <span className="font-medium">{v.type.replace(/_/g, ' ')}</span>
                  <Badge variant={v.status === 'APPROVED' ? 'success' : 'secondary'}>{v.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
