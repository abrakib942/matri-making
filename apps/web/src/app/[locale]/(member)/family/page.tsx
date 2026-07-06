'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnums } from '@/lib/providers/enum-provider';
import { profileApi } from '@/lib/api/endpoints';

interface Member {
  id: number;
  userId: number;
  relationship: string;
  role: string;
  inviteStatus: string;
  user?: { name?: string; email?: string };
}

export default function FamilyPage() {
  const t = useTranslations('member');
  const { label } = useEnums();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .getMine()
      .then((data: unknown) => {
        const profile = Array.isArray(data)
          ? (data as { members?: Member[] }[])[0]
          : ((data as { profiles?: { members?: Member[] }[] })?.profiles?.[0] ??
            (data as { members?: Member[] }));
        const list = (profile as { members?: Member[] })?.members ?? [];
        setMembers(list);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t('family')}</h1>

      {loading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : members.length === 0 ? (
        <p className="text-muted-foreground">No family managers linked to your biodata.</p>
      ) : (
        <div className="space-y-3">
          {members.map(m => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {m.user?.name ?? m.user?.email ?? `User #${m.userId}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{label('memberRelationship', m.relationship)}</span>
                <span>·</span>
                <span>{m.role}</span>
                <Badge variant={m.inviteStatus === 'ACCEPTED' ? 'success' : 'secondary'}>
                  {m.inviteStatus}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
