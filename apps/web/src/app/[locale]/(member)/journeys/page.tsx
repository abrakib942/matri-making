'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { EnumSelect } from '@/components/shared/enum-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { journeyApi } from '@/lib/api/endpoints';

interface Journey {
  id: number;
  stage: string;
  partnerProfile?: { biodataNo?: string; fullName?: string };
  updatedAt?: string;
}

export default function JourneysPage() {
  const t = useTranslations('member');
  const c = useTranslations('common');
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [stageEdits, setStageEdits] = useState<Record<number, string>>({});

  const load = () => {
    setLoading(true);
    journeyApi
      .list()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { items?: Journey[] })?.items ?? [];
        setJourneys(list);
        const edits: Record<number, string> = {};
        list.forEach(j => {
          edits[j.id] = j.stage;
        });
        setStageEdits(edits);
      })
      .catch(() => setJourneys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStage = async (id: number) => {
    const stage = stageEdits[id];
    if (!stage) return;
    setUpdating(id);
    try {
      await journeyApi.updateStage(id, stage);
      load();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('journeys')}</h1>

      {loading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : journeys.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No active journeys. Accept an interest to start one.</p>
      ) : (
        <div className="space-y-4">
          {journeys.map(j => (
            <Card key={j.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {j.partnerProfile?.biodataNo ?? `Journey #${j.id}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-end">
                <div className="flex-1">
                  <EnumSelect
                    category="journeyStage"
                    label="Stage"
                    value={stageEdits[j.id] ?? j.stage}
                    onChange={v => setStageEdits(prev => ({ ...prev, [j.id]: v }))}
                  />
                </div>
                <Button onClick={() => updateStage(j.id)} disabled={updating === j.id}>
                  {updating === j.id ? c('loading') : c('save')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
