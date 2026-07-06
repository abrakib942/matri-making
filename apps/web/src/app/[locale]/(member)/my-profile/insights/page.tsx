'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { intelligenceApi } from '@/lib/api/endpoints';

interface InsightsData {
  redFlags?: string[];
  greenFlags?: string[];
  suggestions?: string[];
  readinessPercent?: number;
  completionPercent?: number;
}

export default function ProfileInsightsPage() {
  const t = useTranslations('member');
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceApi
      .insights()
      .then(d => setData(d as InsightsData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t('insights')}</h1>

      {loading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data ? (
        <p className="text-muted-foreground">Insights are not available yet.</p>
      ) : (
        <>
          {(data.redFlags?.length ?? 0) > 0 && (
            <Card className="border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  Areas to improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.redFlags!.map(flag => (
                    <li key={flag} className="text-sm flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      {flag.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(data.greenFlags?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Green flags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.greenFlags!.map(flag => (
                  <Badge key={flag} variant="success">
                    {flag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {(data.suggestions?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {data.suggestions!.map(s => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {!(data.redFlags?.length || data.greenFlags?.length || data.suggestions?.length) && (
            <p className="text-muted-foreground">
              Your profile looks good. Keep it updated for better matches.
            </p>
          )}
        </>
      )}
    </div>
  );
}
