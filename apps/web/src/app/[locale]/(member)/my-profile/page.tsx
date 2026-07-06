'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ProfileDetailSheet } from '@/components/profile/profile-detail-sheet';
import { ProfileSectionEditor } from '@/components/profile/profile-section-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from '@/i18n/navigation';
import { profileApi } from '@/lib/api/endpoints';
import { unwrapMineProfile } from '@/lib/profile/unwrap-mine';
import type { ProfileDetail } from '@/types/profile';

export default function MyProfilePage() {
  const nav = useTranslations('nav');
  const t = useTranslations('profile');
  const c = useTranslations('common');
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    profileApi
      .getMine()
      .then(data => setProfile(unwrapMineProfile(data)))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">{c('loading')}</p>;
  }

  if (!profile) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="text-2xl font-bold">{nav('myProfile')}</h1>
        <p className="text-muted-foreground">You have not created a biodata yet.</p>
        <Button asChild>
          <Link href="/onboarding">{c('getStarted')}</Link>
        </Button>
      </div>
    );
  }

  if (editOpen) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => {
            setEditOpen(false);
            load();
          }}
        >
          {c('back')}
        </Button>
        <ProfileSectionEditor
          mode={profile.mode}
          loadFromMine
          onComplete={() => {
            setEditOpen(false);
            load();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{nav('myProfile')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/profiles/${profile.id}`}>{t('previewBiodata')}</Link>
          </Button>
          <Button onClick={() => setEditOpen(true)}>{t('editBiodata')}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{profile.biodataNo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {profile.mode} · {profile.status}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span>{profile.completionPercent ?? 0}%</span>
            </div>
            <Progress value={profile.completionPercent ?? 0} />
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('previewBiodata')}</h2>
        <p className="text-sm text-muted-foreground">
          This is how others see your biodata (contact & guardian fields appear locked until
          unlocked).
        </p>
        <ProfileDetailSheet profile={profile} showSectionNav={false} previewAsOwner />
      </section>
    </div>
  );
}
