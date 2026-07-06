'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ProfileWizard } from '@/components/onboarding/profile-wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from '@/i18n/navigation';
import { profileApi } from '@/lib/api/endpoints';
import type { ProfileModeType } from '@/types/api';

interface MyProfile {
  id: number;
  biodataNo: string;
  mode: ProfileModeType;
  status: string;
  completionPercent: number;
}

export default function MyProfilePage() {
  const nav = useTranslations('nav');
  const t = useTranslations('member');
  const c = useTranslations('common');
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .getMine()
      .then((data: unknown) => {
        const profiles = Array.isArray(data)
          ? data
          : (data as { profiles?: MyProfile[] })?.profiles ?? [data];
        setProfile((profiles as MyProfile[])[0] ?? null);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
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
        <Button variant="ghost" onClick={() => setEditOpen(false)}>
          {c('back')}
        </Button>
        <ProfileWizard mode={profile.mode} editMode onComplete={() => setEditOpen(false)} />
      </div>
    );
  }

  const sections = [
    { label: 'Basic info', href: '/onboarding' },
    { label: t('insights'), href: '/my-profile/insights' },
    { label: t('verifications'), href: '/verifications' },
    { label: t('family'), href: '/family' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{nav('myProfile')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{profile.biodataNo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mode: {profile.mode} · Status: {profile.status}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span>{profile.completionPercent}%</span>
            </div>
            <Progress value={profile.completionPercent} />
          </div>
          <Button onClick={() => setEditOpen(true)}>Edit biodata</Button>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border p-4 text-sm font-medium hover:bg-muted transition-colors"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
