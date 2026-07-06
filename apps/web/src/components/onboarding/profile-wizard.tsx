'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { EnumSelect } from '@/components/shared/enum-select';
import { LocationPicker } from '@/components/shared/location-picker';
import { profileApi } from '@/lib/api/endpoints';
import type { ProfileModeType } from '@/types/api';
import { cn } from '@/lib/utils';

const STEPS = ['basic', 'education', 'family', 'mode', 'preference', 'privacy', 'review'] as const;
type Step = (typeof STEPS)[number];

interface ProfileWizardProps {
  mode: ProfileModeType;
  editMode?: boolean;
  onComplete?: () => void;
}

interface WizardState {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  relationship: string;
  maritalStatus: string;
  heightCm: string;
  weightKg: string;
  divisionId: number | null;
  districtId: number | null;
  presentAddress: string;
  educationLevel: string;
  professionKey: string;
  educationDetails: string;
  monthlyIncomeBdt: string;
  fatherAlive: boolean;
  motherAlive: boolean;
  brothersCount: string;
  sistersCount: string;
  familyStatus: string;
  familyValues: string;
  familyDetails: string;
  aboutMe: string;
  prayerFrequency: string;
  madhhab: string;
  hijabStyle: string;
  beardStyle: string;
  deenPracticeDetails: string;
  smoking: string;
  drinking: string;
  diet: string;
  interests: string;
  ageMin: string;
  ageMax: string;
  acceptsChildren: boolean;
  otherExpectations: string;
  visibility: string;
  photoPolicy: string;
  contactPolicy: string;
  hidePhone: boolean;
}

const defaultState = (): WizardState => ({
  fullName: '',
  gender: '',
  dateOfBirth: '',
  relationship: 'SELF',
  maritalStatus: 'NEVER_MARRIED',
  heightCm: '',
  weightKg: '',
  divisionId: null,
  districtId: null,
  presentAddress: '',
  educationLevel: '',
  professionKey: '',
  educationDetails: '',
  monthlyIncomeBdt: '',
  fatherAlive: true,
  motherAlive: true,
  brothersCount: '0',
  sistersCount: '0',
  familyStatus: '',
  familyValues: '',
  familyDetails: '',
  aboutMe: '',
  prayerFrequency: '',
  madhhab: '',
  hijabStyle: '',
  beardStyle: '',
  deenPracticeDetails: '',
  smoking: '',
  drinking: '',
  diet: '',
  interests: '',
  ageMin: '22',
  ageMax: '35',
  acceptsChildren: true,
  otherExpectations: '',
  visibility: 'PUBLIC',
  photoPolicy: 'ON_UNLOCK',
  contactPolicy: 'ON_UNLOCK',
  hidePhone: true,
});

function initState(mode: ProfileModeType): WizardState {
  return {
    ...defaultState(),
    photoPolicy: mode === 'ISLAMIC' ? 'ON_UNLOCK' : 'VISIBLE',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfileToState(profile: any): Partial<WizardState> {
  const pref = profile.partnerPreference ?? profile.preference;
  const privacy = profile.privacySettings ?? profile.privacy;
  const islamic = profile.islamicDetails;
  const general = profile.generalDetails;

  return {
    fullName: profile.fullName ?? '',
    gender: profile.gender ?? '',
    dateOfBirth: profile.dateOfBirth?.slice?.(0, 10) ?? profile.dateOfBirth ?? '',
    maritalStatus: profile.maritalStatus ?? 'NEVER_MARRIED',
    heightCm: profile.heightCm?.toString() ?? '',
    weightKg: profile.weightKg?.toString() ?? '',
    divisionId: profile.divisionId ?? null,
    districtId: profile.districtId ?? null,
    presentAddress: profile.presentAddress ?? '',
    educationLevel: profile.educationLevel ?? '',
    professionKey: profile.professionKey ?? '',
    educationDetails: profile.educationDetails ?? '',
    monthlyIncomeBdt: profile.monthlyIncomeBdt?.toString() ?? '',
    fatherAlive: profile.fatherAlive ?? true,
    motherAlive: profile.motherAlive ?? true,
    brothersCount: profile.brothersCount?.toString() ?? '0',
    sistersCount: profile.sistersCount?.toString() ?? '0',
    familyStatus: profile.familyStatus ?? '',
    familyValues: profile.familyValues ?? '',
    familyDetails: profile.familyDetails ?? '',
    aboutMe: profile.aboutMe ?? '',
    prayerFrequency: islamic?.prayerFrequency ?? '',
    madhhab: islamic?.madhhab ?? '',
    hijabStyle: islamic?.hijabStyle ?? '',
    beardStyle: islamic?.beardStyle ?? '',
    deenPracticeDetails: islamic?.deenPracticeDetails ?? '',
    smoking: general?.smoking ?? '',
    drinking: general?.drinking ?? '',
    diet: general?.diet ?? '',
    interests: (general?.interests as string[] | undefined)?.join(', ') ?? '',
    ageMin: pref?.ageMin?.toString() ?? '22',
    ageMax: pref?.ageMax?.toString() ?? '35',
    acceptsChildren: pref?.acceptsChildren ?? true,
    otherExpectations: pref?.otherExpectations ?? '',
    visibility: privacy?.visibility ?? 'PUBLIC',
    photoPolicy: privacy?.photoPolicy ?? 'ON_UNLOCK',
    contactPolicy: privacy?.contactPolicy ?? 'ON_UNLOCK',
    hidePhone: privacy?.hidePhone ?? true,
  };
}

export function ProfileWizard({ mode, editMode, onComplete }: ProfileWizardProps) {
  const t = useTranslations('onboarding');
  const c = useTranslations('common');
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<WizardState>(() => initState(mode));
  const [profileId, setProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(editMode);

  const step = STEPS[stepIndex] ?? 'basic';
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const stepLabels: Record<Step, string> = {
    basic: t('stepBasic'),
    education: t('stepEducation'),
    family: t('stepFamily'),
    mode: t('stepMode'),
    preference: t('stepPreference'),
    privacy: t('stepPrivacy'),
    review: t('stepReview'),
  };

  const update = useCallback((patch: Partial<WizardState>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!editMode) return;
    profileApi
      .getMine()
      .then((data: unknown) => {
        const profiles = Array.isArray(data)
          ? data
          : ((data as { profiles?: unknown[] })?.profiles ?? [data]);
        const profile = (profiles as { id: number; mode: ProfileModeType }[])[0];
        if (profile?.id) {
          setProfileId(profile.id);
          setForm(prev => ({ ...prev, ...mapProfileToState(profile) }));
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, [editMode]);

  const saveStep = async (): Promise<boolean> => {
    setError('');
    setLoading(true);
    try {
      if (step === 'basic') {
        if (!profileId) {
          const created = await profileApi.create({
            mode,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            fullName: form.fullName,
            relationship: form.relationship,
            maritalStatus: form.maritalStatus,
          });
          setProfileId(created.id);
        } else {
          await profileApi.update(profileId, {
            fullName: form.fullName,
            dateOfBirth: form.dateOfBirth,
            maritalStatus: form.maritalStatus,
            heightCm: form.heightCm ? Number(form.heightCm) : undefined,
            weightKg: form.weightKg ? Number(form.weightKg) : undefined,
            divisionId: form.divisionId ?? undefined,
            districtId: form.districtId ?? undefined,
            presentAddress: form.presentAddress || undefined,
          });
        }
      } else if (step === 'education' && profileId) {
        await profileApi.update(profileId, {
          educationLevel: form.educationLevel || undefined,
          professionKey: form.professionKey || undefined,
          educationDetails: form.educationDetails || undefined,
          monthlyIncomeBdt: form.monthlyIncomeBdt ? Number(form.monthlyIncomeBdt) : undefined,
        });
      } else if (step === 'family' && profileId) {
        await profileApi.update(profileId, {
          fatherAlive: form.fatherAlive,
          motherAlive: form.motherAlive,
          brothersCount: Number(form.brothersCount) || 0,
          sistersCount: Number(form.sistersCount) || 0,
          familyStatus: form.familyStatus || undefined,
          familyValues: form.familyValues || undefined,
          familyDetails: form.familyDetails || undefined,
          aboutMe: form.aboutMe || undefined,
        });
      } else if (step === 'mode' && profileId) {
        if (mode === 'ISLAMIC') {
          await profileApi.updateIslamic(profileId, {
            prayerFrequency: form.prayerFrequency || undefined,
            madhhab: form.madhhab || undefined,
            hijabStyle: form.hijabStyle || undefined,
            beardStyle: form.beardStyle || undefined,
            deenPracticeDetails: form.deenPracticeDetails || undefined,
          });
        } else {
          await profileApi.updateGeneral(profileId, {
            smoking: form.smoking || undefined,
            drinking: form.drinking || undefined,
            diet: form.diet || undefined,
            interests: form.interests
              ? form.interests
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
              : undefined,
          });
        }
      } else if (step === 'preference' && profileId) {
        await profileApi.updatePreference(profileId, {
          ageMin: Number(form.ageMin) || undefined,
          ageMax: Number(form.ageMax) || undefined,
          acceptsChildren: form.acceptsChildren,
          otherExpectations: form.otherExpectations || undefined,
        });
      } else if (step === 'privacy' && profileId) {
        await profileApi.updatePrivacy(profileId, {
          visibility: form.visibility || undefined,
          photoPolicy: form.photoPolicy || undefined,
          contactPolicy: form.contactPolicy || undefined,
          hidePhone: form.hidePhone,
        });
      } else if (step === 'review' && profileId) {
        await profileApi.submit(profileId);
        onComplete?.();
        return true;
      }
      return true;
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Save failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const ok = await saveStep();
    if (!ok) return;
    if (step === 'review') return;
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  };

  const handleBack = () => setStepIndex(i => Math.max(i - 1, 0));

  if (initializing) {
    return <p className="text-muted-foreground text-center py-12">{c('loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="hidden sm:flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  i <= stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden md:inline',
                  i === stepIndex ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {stepLabels[s]}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-border hidden md:block" aria-hidden />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm sm:hidden">
          <span className="font-medium">{stepLabels[step]}</span>
          <span className="text-muted-foreground">
            {stepIndex + 1} / {STEPS.length}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editMode ? t('title') : t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'basic' && (
            <>
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={form.fullName}
                  onChange={e => update({ fullName: e.target.value })}
                  required
                />
              </div>
              <EnumSelect
                category="gender"
                label="Gender"
                value={form.gender}
                onChange={v => update({ gender: v })}
              />
              <div className="space-y-2">
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => update({ dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <EnumSelect
                category="memberRelationship"
                label="Relationship"
                value={form.relationship}
                onChange={v => update({ relationship: v })}
              />
              <EnumSelect
                category="maritalStatus"
                label="Marital status"
                value={form.maritalStatus}
                onChange={v => update({ maritalStatus: v })}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={form.heightCm}
                    onChange={e => update({ heightCm: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={form.weightKg}
                    onChange={e => update({ weightKg: e.target.value })}
                  />
                </div>
              </div>
              <LocationPicker
                divisionId={form.divisionId}
                districtId={form.districtId}
                onDivisionChange={id => update({ divisionId: id })}
                onDistrictChange={id => update({ districtId: id })}
              />
              <div className="space-y-2">
                <Label>Present address</Label>
                <Textarea
                  value={form.presentAddress}
                  onChange={e => update({ presentAddress: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 'education' && (
            <>
              <EnumSelect
                category="educationLevel"
                label="Education level"
                value={form.educationLevel}
                onChange={v => update({ educationLevel: v })}
              />
              <EnumSelect
                category="profession"
                label="Profession"
                value={form.professionKey}
                onChange={v => update({ professionKey: v })}
              />
              <div className="space-y-2">
                <Label>Education details</Label>
                <Textarea
                  value={form.educationDetails}
                  onChange={e => update({ educationDetails: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly income (BDT)</Label>
                <Input
                  type="number"
                  value={form.monthlyIncomeBdt}
                  onChange={e => update({ monthlyIncomeBdt: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 'family' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.fatherAlive}
                    onChange={e => update({ fatherAlive: e.target.checked })}
                  />
                  Father alive
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.motherAlive}
                    onChange={e => update({ motherAlive: e.target.checked })}
                  />
                  Mother alive
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brothers</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.brothersCount}
                    onChange={e => update({ brothersCount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sisters</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.sistersCount}
                    onChange={e => update({ sistersCount: e.target.value })}
                  />
                </div>
              </div>
              <EnumSelect
                category="familyStatus"
                label="Family status"
                value={form.familyStatus}
                onChange={v => update({ familyStatus: v })}
              />
              <EnumSelect
                category="familyValues"
                label="Family values"
                value={form.familyValues}
                onChange={v => update({ familyValues: v })}
              />
              <div className="space-y-2">
                <Label>Family details</Label>
                <Textarea
                  value={form.familyDetails}
                  onChange={e => update({ familyDetails: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>About me</Label>
                <Textarea
                  value={form.aboutMe}
                  onChange={e => update({ aboutMe: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 'mode' && mode === 'ISLAMIC' && (
            <>
              <EnumSelect
                category="prayerFrequency"
                label="Prayer frequency"
                value={form.prayerFrequency}
                onChange={v => update({ prayerFrequency: v })}
              />
              <EnumSelect
                category="madhhab"
                label="Madhhab"
                value={form.madhhab}
                onChange={v => update({ madhhab: v })}
              />
              <EnumSelect
                category="hijabStyle"
                label="Hijab style"
                value={form.hijabStyle}
                onChange={v => update({ hijabStyle: v })}
              />
              <EnumSelect
                category="beardStyle"
                label="Beard style"
                value={form.beardStyle}
                onChange={v => update({ beardStyle: v })}
              />
              <div className="space-y-2">
                <Label>Deen practice details</Label>
                <Textarea
                  value={form.deenPracticeDetails}
                  onChange={e => update({ deenPracticeDetails: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 'mode' && mode === 'GENERAL' && (
            <>
              <EnumSelect
                category="smokingHabit"
                label="Smoking"
                value={form.smoking}
                onChange={v => update({ smoking: v })}
              />
              <EnumSelect
                category="drinkingHabit"
                label="Drinking"
                value={form.drinking}
                onChange={v => update({ drinking: v })}
              />
              <EnumSelect
                category="dietPreference"
                label="Diet"
                value={form.diet}
                onChange={v => update({ diet: v })}
              />
              <div className="space-y-2">
                <Label>Interests (comma-separated)</Label>
                <Input
                  value={form.interests}
                  onChange={e => update({ interests: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 'preference' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min age</Label>
                  <Input
                    type="number"
                    value={form.ageMin}
                    onChange={e => update({ ageMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max age</Label>
                  <Input
                    type="number"
                    value={form.ageMax}
                    onChange={e => update({ ageMax: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.acceptsChildren}
                  onChange={e => update({ acceptsChildren: e.target.checked })}
                />
                Accepts partner with children
              </label>
              <div className="space-y-2">
                <Label>Other expectations</Label>
                <Textarea
                  value={form.otherExpectations}
                  onChange={e => update({ otherExpectations: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 'privacy' && (
            <>
              <EnumSelect
                category="profileVisibility"
                label="Visibility"
                value={form.visibility}
                onChange={v => update({ visibility: v })}
              />
              <EnumSelect
                category="photoPolicy"
                label="Photo policy"
                value={form.photoPolicy}
                onChange={v => update({ photoPolicy: v })}
              />
              <EnumSelect
                category="contactPolicy"
                label="Contact policy"
                value={form.contactPolicy}
                onChange={v => update({ contactPolicy: v })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.hidePhone}
                  onChange={e => update({ hidePhone: e.target.checked })}
                />
                Hide phone number
              </label>
            </>
          )}

          {step === 'review' && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Name:</strong> {form.fullName}
              </p>
              <p>
                <strong>Mode:</strong> {mode}
              </p>
              <p>
                <strong>Gender:</strong> {form.gender}
              </p>
              <p>
                <strong>Education:</strong> {form.educationLevel || '—'}
              </p>
              <p>
                <strong>Partner age:</strong> {form.ageMin} – {form.ageMax}
              </p>
              <p className="text-muted-foreground">Review your biodata and submit for approval.</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            {stepIndex > 0 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                {c('back')}
              </Button>
            )}
            <Button type="button" className="flex-1" onClick={handleNext} disabled={loading}>
              {loading ? c('loading') : step === 'review' ? t('submitForApproval') : c('continue')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
