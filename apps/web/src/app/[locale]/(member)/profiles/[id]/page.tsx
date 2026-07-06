'use client';

import { Heart, Lock, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { use, useEffect, useState } from 'react';
import { CompatibilityBadge } from '@/components/profile/compatibility-badge';
import { ReadinessMeter } from '@/components/profile/readiness-meter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnums } from '@/lib/providers/enum-provider';
import { interestApi, intelligenceApi, paymentApi, profileApi } from '@/lib/api/endpoints';

interface ProfileDetail {
  id: number;
  biodataNo: string;
  fullName?: string;
  mode: string;
  gender: string;
  age?: number;
  maritalStatus?: string;
  educationLevel?: string;
  professionKey?: string;
  aboutMe?: string;
  greenFlags?: string[];
  verificationBadges?: string[];
  isPremium?: boolean;
  canViewContact?: boolean;
  contactPhone?: string;
  contactEmail?: string;
  islamicDetails?: Record<string, unknown>;
  familyDetails?: Record<string, unknown>;
  partnerPreference?: Record<string, unknown>;
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profileId = Number(id);
  const t = useTranslations('profile');
  const c = useTranslations('common');
  const { label } = useEnums();

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [compatibility, setCompatibility] = useState<number | null>(null);
  const [readiness, setReadiness] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestMsg, setInterestMsg] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      profileApi.getById(profileId),
      intelligenceApi.compatibility(profileId).catch(() => null),
      intelligenceApi.readiness(profileId).catch(() => null),
    ])
      .then(([p, comp, ready]) => {
        setProfile(p as ProfileDetail);
        const compData = comp as { percent?: number; compatibilityPercent?: number } | null;
        const readyData = ready as { percent?: number; readinessPercent?: number } | null;
        setCompatibility(compData?.percent ?? compData?.compatibilityPercent ?? null);
        setReadiness(readyData?.percent ?? readyData?.readinessPercent ?? null);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!Number.isNaN(profileId)) load();
  }, [profileId]);

  const runAction = async (action: string, fn: () => Promise<unknown>) => {
    setActionLoading(action);
    try {
      await fn();
      load();
    } catch {
      /* ignore */
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (!profile) {
    return <p className="text-muted-foreground">{t('notFound')}</p>;
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
      <div className="lg:sticky lg:top-20 space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground/40">
                {profile.biodataNo.slice(-2)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.biodataNo}</h1>
              <p className="text-sm text-muted-foreground">
                {profile.age ? `${profile.age} ${t('years')}` : ''}
                {profile.maritalStatus ? ` · ${label('maritalStatus', profile.maritalStatus)}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {compatibility != null && <CompatibilityBadge percent={compatibility} />}
              {profile.isPremium && <Badge variant="secondary">{c('premium')}</Badge>}
              <Badge variant="outline">{label('gender', profile.gender)}</Badge>
            </div>
            {readiness != null && <ReadinessMeter percent={readiness} />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder={t('interestMessage')}
              value={interestMsg}
              onChange={e => setInterestMsg(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="gap-1.5 col-span-2"
                disabled={!!actionLoading}
                onClick={() =>
                  runAction('interest', () =>
                    interestApi.send({ toProfileId: profileId, message: interestMsg || undefined }),
                  )
                }
              >
                <Heart className="h-4 w-4" />
                {actionLoading === 'interest' ? c('loading') : t('sendInterest')}
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                disabled={!!actionLoading}
                onClick={() => runAction('shortlist', () => interestApi.shortlist(profileId))}
              >
                <Star className="h-4 w-4" />
                {t('shortlist')}
              </Button>
              <Button
                variant="outline"
                disabled={!!actionLoading}
                onClick={() => runAction('favourite', () => interestApi.favourite(profileId))}
              >
                {t('favourite')}
              </Button>
            </div>
            {!profile.canViewContact && (
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={!!actionLoading}
                onClick={() => runAction('unlock', () => paymentApi.unlock(profileId, 'CONTACT'))}
              >
                <Lock className="h-4 w-4" />
                {actionLoading === 'unlock' ? c('loading') : t('unlockContact')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="personal">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="personal">{t('tabPersonal')}</TabsTrigger>
            <TabsTrigger value="deen">{t('tabDeen')}</TabsTrigger>
            <TabsTrigger value="family">{t('tabFamily')}</TabsTrigger>
            <TabsTrigger value="preference">{t('tabPreference')}</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('tabPersonal')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>{t('education')}:</strong>{' '}
                  {label('educationLevel', profile.educationLevel)}
                </p>
                <p>
                  <strong>{t('profession')}:</strong> {label('profession', profile.professionKey)}
                </p>
                {profile.aboutMe && <p className="whitespace-pre-line pt-2">{profile.aboutMe}</p>}
                {(profile.greenFlags?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {profile.greenFlags!.map(f => (
                      <Badge key={f} variant="success">
                        {f.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deen">
            <Card>
              <CardContent className="p-6 text-sm space-y-2">
                {profile.mode === 'ISLAMIC' ? (
                  Object.entries(profile.islamicDetails ?? {}).map(([k, v]) =>
                    v ? (
                      <p key={k}>
                        <strong>{k}:</strong> {String(v)}
                      </p>
                    ) : null,
                  )
                ) : (
                  <p className="text-muted-foreground">{t('generalModeProfile')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                {profile.familyDetails
                  ? JSON.stringify(profile.familyDetails)
                  : t('familyNotAvailable')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preference">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                {profile.partnerPreference
                  ? JSON.stringify(profile.partnerPreference)
                  : t('preferenceNotAvailable')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {profile.canViewContact ? (
          <Card>
            <CardContent className="pt-6 space-y-1 text-sm">
              {profile.contactPhone && (
                <p>
                  <strong>{t('phone')}:</strong> {profile.contactPhone}
                </p>
              )}
              {profile.contactEmail && (
                <p>
                  <strong>{t('email')}:</strong> {profile.contactEmail}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('contactLocked')}</p>
              <Button
                variant="outline"
                disabled={!!actionLoading}
                onClick={() => runAction('unlock', () => paymentApi.unlock(profileId, 'CONTACT'))}
              >
                {t('unlockContact')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
