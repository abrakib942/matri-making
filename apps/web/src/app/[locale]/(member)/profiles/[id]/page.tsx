'use client';

import { Heart, Lock, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { use, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChatPanel } from '@/components/chat/chat-panel';
import { CompatibilityBadge } from '@/components/profile/compatibility-badge';
import { MatchBreakdownRing } from '@/components/profile/match-breakdown-ring';
import { ProfileDetailSheet } from '@/components/profile/profile-detail-sheet';
import { calcAge } from '@/components/profile/profile-sections';
import { ReadinessMeter } from '@/components/profile/readiness-meter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useEnums } from '@/lib/providers/enum-provider';
import { chatApi, interestApi, intelligenceApi, paymentApi, profileApi } from '@/lib/api/endpoints';
import type { ApiResponse, CompatibilityResult } from '@/types/api';
import type { ProfileDetail } from '@/types/profile';

interface ActiveChat {
  id: number;
  expiresAt: string;
  waliMonitoring: boolean;
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as ApiResponse).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profileId = Number(id);
  const t = useTranslations('profile');
  const c = useTranslations('common');
  const safety = useTranslations('safety');
  const search = useTranslations('search');
  const { label } = useEnums();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [readiness, setReadiness] = useState<number | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [hasOwnBiodata, setHasOwnBiodata] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestMsg, setInterestMsg] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const extras = isAuthenticated
      ? [
          intelligenceApi.compatibility(profileId).catch(() => null),
          intelligenceApi.readiness(profileId).catch(() => null),
        ]
      : [Promise.resolve(null), Promise.resolve(null)];

    Promise.all([profileApi.getById(profileId), ...extras])
      .then(([p, comp, ready]) => {
        const prof = p as ProfileDetail;
        setProfile(prof);
        setCompatibility((comp as CompatibilityResult) ?? null);
        const readyData = ready as { percent?: number; readinessPercent?: number } | null;
        setReadiness(readyData?.percent ?? readyData?.readinessPercent ?? null);

        if (prof.access?.canAccessSafeChat && prof.access.activeChatRoomId) {
          chatApi
            .listRooms()
            .then(rooms => {
              const room = (rooms as ActiveChat[]).find(
                r => r.id === prof.access?.activeChatRoomId,
              );
              if (room) setActiveChat(room);
            })
            .catch(() => {});
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [profileId, isAuthenticated]);

  useEffect(() => {
    if (!Number.isNaN(profileId)) load();
  }, [profileId, load]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCreditBalance(null);
      setHasOwnBiodata(null);
      return;
    }

    Promise.all([
      paymentApi.wallet().catch(() => ({ balance: 0 })),
      profileApi.getMine().catch(() => []),
    ]).then(([wallet, mine]) => {
      setCreditBalance(wallet.balance ?? 0);
      const profiles = Array.isArray(mine) ? mine : [];
      setHasOwnBiodata(profiles.length > 0);
    });
  }, [isAuthenticated]);

  const runAction = async (
    action: string,
    fn: () => Promise<unknown>,
    options?: { successMessage?: string },
  ) => {
    setActionLoading(action);
    try {
      await fn();
      if (options?.successMessage) toast.success(options.successMessage);
      load();
      if (isAuthenticated) {
        paymentApi
          .wallet()
          .then(w => setCreditBalance(w.balance ?? 0))
          .catch(() => {});
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('actionFailed')));
    } finally {
      setActionLoading('');
    }
  };

  const handleUnlock = async () => {
    setActionLoading('unlock');
    try {
      const res = await paymentApi.unlock(profileId, 'CONTACT');
      const successMsg =
        profile?.mode === 'ISLAMIC' ? t('unlockSuccessIslamic') : t('unlockSuccessGeneral');
      const detail =
        res.discountApplied && res.creditsCharged != null
          ? `${successMsg} (${res.creditsCharged} credit${res.creditsCharged === 1 ? '' : 's'})`
          : successMsg;
      toast.success(detail);
      if (res.chatRoom) setActiveChat(res.chatRoom);
      load();
      const wallet = await paymentApi.wallet().catch(() => null);
      if (wallet) setCreditBalance(wallet.balance ?? 0);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('actionFailed')));
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

  const age = calcAge(profile.dateOfBirth);
  const canViewContact = profile.access?.canViewContact;
  const canAccessSafeChat = profile.access?.canAccessSafeChat;
  const unlockLabel = profile.mode === 'ISLAMIC' ? t('unlockSafeChat') : t('unlockContactAndChat');
  const needsOwnBiodata = profile.mode === 'ISLAMIC' && hasOwnBiodata === false;
  const insufficientCredits = creditBalance !== null && creditBalance < 1;
  const showUnlockCta = !canViewContact && !canAccessSafeChat;

  const renderUnlockBlock = (className?: string) => {
    if (!showUnlockCta) return null;

    if (needsOwnBiodata) {
      return (
        <Alert variant="warning" className={className}>
          <AlertDescription className="space-y-2">
            <p>{t('unlockNeedBiodata')}</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/onboarding">{t('createBiodataFirst')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (insufficientCredits) {
      return (
        <Alert variant="warning" className={className}>
          <AlertDescription className="space-y-2">
            <p>{t('unlockInsufficientCredits')}</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/wallet">{t('goToWallet')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className={className}>
        {creditBalance !== null && (
          <p className="text-xs text-muted-foreground mb-2 text-center">
            {t('creditsAvailable', { count: creditBalance })}
          </p>
        )}
        <Button
          variant="outline"
          className="w-full gap-2"
          disabled={!!actionLoading}
          onClick={handleUnlock}
        >
          <Lock className="h-4 w-4" />
          {actionLoading === 'unlock' ? c('loading') : unlockLabel}
        </Button>
      </div>
    );
  };

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
                {age != null ? `${age} ${t('years')}` : ''}
                {profile.maritalStatus ? ` · ${label('maritalStatus', profile.maritalStatus)}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAuthenticated && compatibility != null && (
                <CompatibilityBadge percent={compatibility.mandatoryPercent} />
              )}
              {profile.isPremium && <Badge variant="secondary">{c('premium')}</Badge>}
              <Badge variant="outline">{label('gender', profile.gender)}</Badge>
            </div>
            {isAuthenticated && readiness != null && <ReadinessMeter percent={readiness} />}
          </CardContent>
        </Card>

        {compatibility && isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('matchBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchBreakdownRing
                mandatoryPercent={compatibility.mandatoryPercent}
                overallPercent={compatibility.overallPercent}
                mandatoryBreakdown={compatibility.mandatoryBreakdown}
                overallBreakdown={compatibility.breakdown}
              />
            </CardContent>
          </Card>
        )}

        {isAuthenticated ? (
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
                    runAction(
                      'interest',
                      () =>
                        interestApi.send({
                          toProfileId: profileId,
                          message: interestMsg || undefined,
                        }),
                      { successMessage: t('interestSent') },
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
              {renderUnlockBlock()}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-5 space-y-3 text-center">
              <p className="text-sm text-muted-foreground">{search('guestProfileCta')}</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="rounded-full">
                  <Link href={`/register?returnUrl=${encodeURIComponent(pathname)}`}>
                    {search('guestCreateCta')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`}>
                    {c('login')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4 min-w-0">
        <Alert variant="warning">
          <AlertTitle>
            {profile.mode === 'ISLAMIC' ? safety('islamic.title') : safety('general.title')}
          </AlertTitle>
          <AlertDescription>
            {profile.mode === 'ISLAMIC' ? safety('islamic.body') : safety('general.body')}
          </AlertDescription>
        </Alert>

        {activeChat && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('safeChat')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatPanel
                roomId={activeChat.id}
                expiresAt={activeChat.expiresAt}
                waliMonitoring={activeChat.waliMonitoring ?? profile.mode === 'ISLAMIC'}
              />
            </CardContent>
          </Card>
        )}

        <ProfileDetailSheet profile={profile} />

        {isAuthenticated && showUnlockCta && (
          <Card className="border-dashed">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('contactLocked')}</p>
              {renderUnlockBlock('w-full max-w-sm')}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
