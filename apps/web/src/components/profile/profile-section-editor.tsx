'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EnumSelect } from '@/components/shared/enum-select';
import { LocationPicker } from '@/components/shared/location-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { profileApi } from '@/lib/api/endpoints';
import { unwrapMineProfile } from '@/lib/profile/unwrap-mine';
import type { ProfileDetail, ProfileModeType } from '@/types/profile';
import { getVisibleSections, type SectionId } from './profile-sections';
import { cn } from '@/lib/utils';

type EditorSectionId = Exclude<SectionId, 'media'>;

interface Props {
  mode: ProfileModeType;
  profileId?: number | null;
  loadFromMine?: boolean;
  onProfileCreated?: (id: number) => void;
  onComplete?: () => void;
}

function tagsToString(v?: string[] | null) {
  return v?.join(', ') ?? '';
}

function parseTags(s: string) {
  return s
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
}

function profileToForm(p: ProfileDetail, mode: ProfileModeType) {
  const islamic = p.islamicDetails ?? {};
  const general = p.generalDetails ?? {};
  const pref = p.preference ?? {};
  const privacy = p.privacySettings ?? {};

  return {
    fullName: p.fullName ?? '',
    gender: p.gender ?? '',
    dateOfBirth: p.dateOfBirth?.slice?.(0, 10) ?? '',
    maritalStatus: p.maritalStatus ?? 'NEVER_MARRIED',
    childrenCount: p.childrenCount?.toString() ?? '0',
    heightCm: p.heightCm?.toString() ?? '',
    weightKg: p.weightKg?.toString() ?? '',
    complexion: p.complexion ?? '',
    bloodGroup: p.bloodGroup ?? '',
    religion: p.religion ?? 'ISLAM',
    divisionId: p.divisionId ?? null,
    districtId: p.districtId ?? null,
    upazilaId: p.upazilaId ?? null,
    countryId: p.countryId ?? null,
    areaName: p.areaName ?? '',
    presentAddress: p.presentAddress ?? '',
    permanentAddress: p.permanentAddress ?? '',
    isExpat: p.isExpat ?? false,
    educationLevel: p.educationLevel ?? '',
    educationDetails: p.educationDetails ?? '',
    professionKey: p.professionKey ?? '',
    professionDetails: p.professionDetails ?? '',
    monthlyIncomeBdt: p.monthlyIncomeBdt?.toString() ?? '',
    languages: tagsToString(p.languages),
    fatherAlive: p.fatherAlive ?? true,
    fatherOccupation: p.fatherOccupation ?? '',
    motherAlive: p.motherAlive ?? true,
    motherOccupation: p.motherOccupation ?? '',
    brothersCount: p.brothersCount?.toString() ?? '0',
    sistersCount: p.sistersCount?.toString() ?? '0',
    familyStatus: p.familyStatus ?? '',
    familyValues: p.familyValues ?? '',
    familyDetails: p.familyDetails ?? '',
    hasHealthIssues: p.hasHealthIssues ?? false,
    healthDetails: p.healthDetails ?? '',
    aboutMe: p.aboutMe ?? '',
    partnerExpectation: p.partnerExpectation ?? '',
    futureGoals: p.futureGoals ?? '',
    contactPhone: p.contactPhone ?? '',
    contactEmail: p.contactEmail ?? '',
    aqidah: islamic.aqidah ?? '',
    madhhab: islamic.madhhab ?? '',
    prayerFrequency: islamic.prayerFrequency ?? '',
    praysInCongregation: islamic.praysInCongregation ?? false,
    practicingSince: islamic.practicingSince ?? '',
    beardStyle: islamic.beardStyle ?? '',
    hijabStyle: islamic.hijabStyle ?? '',
    wearsAboveAnkles: islamic.wearsAboveAnkles ?? false,
    mahramCompliance: islamic.mahramCompliance ?? false,
    quranMemorization: islamic.quranMemorization ?? '',
    quranRecitation: islamic.quranRecitation ?? '',
    islamicEducation: islamic.islamicEducation ?? '',
    madrasaBackground: islamic.madrasaBackground ?? false,
    islamicActivities: islamic.islamicActivities ?? '',
    dawahInvolvement: islamic.dawahInvolvement ?? '',
    listensToMusic: islamic.listensToMusic ?? false,
    watchesDramas: islamic.watchesDramas ?? false,
    dressOutside: islamic.dressOutside ?? '',
    deenPracticeDetails: islamic.deenPracticeDetails ?? '',
    marriageExpectations: islamic.marriageExpectations ?? '',
    polygynyPreference: islamic.polygynyPreference ?? '',
    viewsOnLoans: islamic.viewsOnLoans ?? '',
    waliName: islamic.waliName ?? '',
    waliRelation: islamic.waliRelation ?? '',
    waliPhone: islamic.waliPhone ?? '',
    waliApproves: islamic.waliApproves ?? false,
    smoking: general.smoking ?? '',
    drinking: general.drinking ?? '',
    diet: general.diet ?? '',
    interests: tagsToString(general.interests),
    hobbies: tagsToString(general.hobbies),
    personalityTraits: tagsToString(general.personalityTraits),
    careerGoals: general.careerGoals ?? '',
    socialPreferences: general.socialPreferences ?? '',
    travelPreference: general.travelPreference ?? '',
    ageMin: pref.ageMin?.toString() ?? '22',
    ageMax: pref.ageMax?.toString() ?? '35',
    heightCmMin: pref.heightCmMin?.toString() ?? '',
    heightCmMax: pref.heightCmMax?.toString() ?? '',
    maritalStatuses: tagsToString(pref.maritalStatuses),
    educationLevels: tagsToString(pref.educationLevels),
    professionKeys: tagsToString(pref.professionKeys),
    acceptsChildren: pref.acceptsChildren ?? true,
    acceptsExpat: pref.acceptsExpat ?? true,
    minPrayerFrequency: pref.minPrayerFrequency ?? '',
    hijabExpectation: pref.hijabExpectation ?? '',
    beardExpectation: pref.beardExpectation ?? '',
    quranExpectation: pref.quranExpectation ?? '',
    viewsOnLoansExpect: pref.viewsOnLoansExpect ?? '',
    otherExpectations: pref.otherExpectations ?? '',
    dealBreakers: tagsToString(pref.dealBreakers),
    visibility: privacy.visibility ?? 'PUBLIC',
    photoPolicy: privacy.photoPolicy ?? (mode === 'ISLAMIC' ? 'ON_UNLOCK' : 'VISIBLE'),
    contactPolicy: privacy.contactPolicy ?? 'ON_UNLOCK',
    hidePhone: privacy.hidePhone ?? true,
    hideLocation: privacy.hideLocation ?? false,
  };
}

type FormState = ReturnType<typeof profileToForm>;

export function ProfileSectionEditor({
  mode,
  profileId: initialId,
  loadFromMine,
  onProfileCreated,
  onComplete,
}: Props) {
  const t = useTranslations('profile');
  const c = useTranslations('common');
  const [profileId, setProfileId] = useState<number | null>(initialId ?? null);
  const [gender, setGender] = useState('');
  const [form, setForm] = useState<FormState>(() => ({
    ...profileToForm({ id: 0, biodataNo: '', mode, gender: '' } as ProfileDetail, mode),
    photoPolicy: mode === 'ISLAMIC' ? 'ON_UNLOCK' : 'VISIBLE',
  }));
  const [active, setActive] = useState<EditorSectionId>('basics');
  const [loading, setLoading] = useState(!!initialId || !!loadFromMine);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const stubProfile = useMemo(
    () =>
      ({ id: profileId ?? 0, biodataNo: '', mode, gender: gender || form.gender }) as ProfileDetail,
    [profileId, mode, gender, form.gender],
  );

  const editorSections = useMemo(
    () =>
      getVisibleSections(stubProfile, { includePrivacy: true }).filter(s => s.id !== 'media') as {
        id: EditorSectionId;
      }[],
    [stubProfile],
  );

  const patch = useCallback((p: Partial<FormState>) => setForm(prev => ({ ...prev, ...p })), []);

  useEffect(() => {
    if (!initialId && !loadFromMine) return;
    setLoading(true);
    const loader =
      loadFromMine || !initialId ? profileApi.getMine() : profileApi.getById(initialId);
    loader
      .then(data => {
        const p = loadFromMine || !initialId ? unwrapMineProfile(data) : (data as ProfileDetail);
        if (p) {
          setProfileId(p.id);
          setGender(p.gender);
          setForm(profileToForm(p, p.mode));
        }
      })
      .finally(() => setLoading(false));
  }, [initialId, loadFromMine]);

  const save = async () => {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      let id = profileId;

      if (active === 'basics' && !id) {
        const created = await profileApi.create({
          mode,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          fullName: form.fullName,
          relationship: 'SELF',
          maritalStatus: form.maritalStatus,
        });
        id = created.id;
        setProfileId(id);
        onProfileCreated?.(id);
      }

      if (!id) {
        setError('Save basics first to create your biodata.');
        return;
      }

      if (active === 'basics') {
        await profileApi.update(id, {
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth,
          maritalStatus: form.maritalStatus,
          childrenCount: Number(form.childrenCount) || 0,
          heightCm: form.heightCm ? Number(form.heightCm) : undefined,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          complexion: form.complexion || undefined,
          bloodGroup: form.bloodGroup || undefined,
          religion: form.religion || undefined,
        });
      } else if (active === 'location') {
        await profileApi.update(id, {
          countryId: form.countryId ?? undefined,
          divisionId: form.divisionId ?? undefined,
          districtId: form.districtId ?? undefined,
          upazilaId: form.upazilaId ?? undefined,
          areaName: form.areaName || undefined,
          presentAddress: form.presentAddress || undefined,
          permanentAddress: form.permanentAddress || undefined,
          isExpat: form.isExpat,
        });
      } else if (active === 'education') {
        await profileApi.update(id, {
          educationLevel: form.educationLevel || undefined,
          educationDetails: form.educationDetails || undefined,
          professionKey: form.professionKey || undefined,
          professionDetails: form.professionDetails || undefined,
          monthlyIncomeBdt: form.monthlyIncomeBdt ? Number(form.monthlyIncomeBdt) : undefined,
          languages: parseTags(form.languages),
        });
      } else if (active === 'family') {
        await profileApi.update(id, {
          fatherAlive: form.fatherAlive,
          fatherOccupation: form.fatherOccupation || undefined,
          motherAlive: form.motherAlive,
          motherOccupation: form.motherOccupation || undefined,
          brothersCount: Number(form.brothersCount) || 0,
          sistersCount: Number(form.sistersCount) || 0,
          familyStatus: form.familyStatus || undefined,
          familyValues: form.familyValues || undefined,
          familyDetails: form.familyDetails || undefined,
        });
      } else if (active === 'health') {
        await profileApi.update(id, {
          hasHealthIssues: form.hasHealthIssues,
          healthDetails: form.healthDetails || undefined,
        });
      } else if (active === 'about') {
        await profileApi.update(id, {
          aboutMe: form.aboutMe || undefined,
          partnerExpectation: form.partnerExpectation || undefined,
          futureGoals: form.futureGoals || undefined,
        });
      } else if (active === 'deen' && mode === 'ISLAMIC') {
        await profileApi.updateIslamic(id, {
          aqidah: form.aqidah || undefined,
          madhhab: form.madhhab || undefined,
          prayerFrequency: form.prayerFrequency || undefined,
          praysInCongregation: form.praysInCongregation,
          practicingSince: form.practicingSince || undefined,
          beardStyle: form.beardStyle || undefined,
          hijabStyle: form.hijabStyle || undefined,
          wearsAboveAnkles: form.wearsAboveAnkles,
          mahramCompliance: form.mahramCompliance,
          quranMemorization: form.quranMemorization || undefined,
          quranRecitation: form.quranRecitation || undefined,
          islamicEducation: form.islamicEducation || undefined,
          madrasaBackground: form.madrasaBackground,
          islamicActivities: form.islamicActivities || undefined,
          dawahInvolvement: form.dawahInvolvement || undefined,
          listensToMusic: form.listensToMusic,
          watchesDramas: form.watchesDramas,
          dressOutside: form.dressOutside || undefined,
          deenPracticeDetails: form.deenPracticeDetails || undefined,
          marriageExpectations: form.marriageExpectations || undefined,
          polygynyPreference: form.polygynyPreference || undefined,
          viewsOnLoans: form.viewsOnLoans || undefined,
        });
      } else if (active === 'lifestyle' && mode === 'GENERAL') {
        await profileApi.updateGeneral(id, {
          smoking: form.smoking || undefined,
          drinking: form.drinking || undefined,
          diet: form.diet || undefined,
          interests: parseTags(form.interests),
          hobbies: parseTags(form.hobbies),
          personalityTraits: parseTags(form.personalityTraits),
          careerGoals: form.careerGoals || undefined,
          socialPreferences: form.socialPreferences || undefined,
          travelPreference: form.travelPreference || undefined,
        });
      } else if (active === 'guardian' && mode === 'ISLAMIC') {
        await profileApi.updateIslamic(id, {
          waliName: form.waliName || undefined,
          waliRelation: form.waliRelation || undefined,
          waliPhone: form.waliPhone || undefined,
          waliApproves: form.waliApproves,
        });
      } else if (active === 'partner') {
        await profileApi.updatePreference(id, {
          ageMin: Number(form.ageMin) || undefined,
          ageMax: Number(form.ageMax) || undefined,
          heightCmMin: form.heightCmMin ? Number(form.heightCmMin) : undefined,
          heightCmMax: form.heightCmMax ? Number(form.heightCmMax) : undefined,
          maritalStatuses: parseTags(form.maritalStatuses),
          educationLevels: parseTags(form.educationLevels),
          professionKeys: parseTags(form.professionKeys),
          minPrayerFrequency: form.minPrayerFrequency || undefined,
          hijabExpectation: form.hijabExpectation || undefined,
          beardExpectation: form.beardExpectation || undefined,
          quranExpectation: form.quranExpectation || undefined,
          viewsOnLoansExpect: form.viewsOnLoansExpect || undefined,
          acceptsChildren: form.acceptsChildren,
          acceptsExpat: form.acceptsExpat,
          otherExpectations: form.otherExpectations || undefined,
          dealBreakers: parseTags(form.dealBreakers),
        });
      } else if (active === 'contact') {
        await profileApi.update(id, {
          contactPhone: form.contactPhone || undefined,
          contactEmail: form.contactEmail || undefined,
        });
      } else if (active === 'privacy') {
        await profileApi.updatePrivacy(id, {
          visibility: form.visibility,
          photoPolicy: form.photoPolicy,
          contactPolicy: form.contactPolicy,
          hidePhone: form.hidePhone,
          hideLocation: form.hideLocation,
        });
      }

      setMessage(t('sectionSaved'));
      if (active === 'privacy' && onComplete) onComplete();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const showField = (genderFilter?: 'MALE' | 'FEMALE') => {
    const g = gender || form.gender;
    if (!genderFilter || !g) return true;
    return g === genderFilter;
  };

  if (loading) {
    return <p className="text-muted-foreground">{c('loading')}</p>;
  }

  const renderFields = () => {
    switch (active) {
      case 'basics':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.fullName')}</Label>
              <Input value={form.fullName} onChange={e => patch({ fullName: e.target.value })} />
            </div>
            {!profileId && (
              <div className="space-y-2">
                <EnumSelect
                  category="gender"
                  label={t('fields.gender')}
                  value={form.gender}
                  onChange={v => {
                    patch({ gender: v });
                    setGender(v);
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('fields.dateOfBirth')}</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={e => patch({ dateOfBirth: e.target.value })}
              />
            </div>
            <EnumSelect
              category="maritalStatus"
              label={t('fields.maritalStatus')}
              value={form.maritalStatus}
              onChange={v => patch({ maritalStatus: v })}
            />
            <div className="space-y-2">
              <Label>{t('fields.childrenCount')}</Label>
              <Input
                type="number"
                value={form.childrenCount}
                onChange={e => patch({ childrenCount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.heightCm')}</Label>
              <Input
                type="number"
                value={form.heightCm}
                onChange={e => patch({ heightCm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.weightKg')}</Label>
              <Input
                type="number"
                value={form.weightKg}
                onChange={e => patch({ weightKg: e.target.value })}
              />
            </div>
            <EnumSelect
              category="complexion"
              label={t('fields.complexion')}
              value={form.complexion}
              onChange={v => patch({ complexion: v })}
            />
            <EnumSelect
              category="bloodGroup"
              label={t('fields.bloodGroup')}
              value={form.bloodGroup}
              onChange={v => patch({ bloodGroup: v })}
            />
          </div>
        );
      case 'location':
        return (
          <div className="space-y-4">
            <LocationPicker
              countryId={form.countryId}
              divisionId={form.divisionId}
              districtId={form.districtId}
              upazilaId={form.upazilaId}
              onCountryChange={id => patch({ countryId: id })}
              onDivisionChange={id => patch({ divisionId: id, districtId: null, upazilaId: null })}
              onDistrictChange={id => patch({ districtId: id, upazilaId: null })}
              onUpazilaChange={id => patch({ upazilaId: id })}
            />
            <div className="space-y-2">
              <Label>{t('fields.areaName')}</Label>
              <Input
                value={form.areaName}
                onChange={e => patch({ areaName: e.target.value })}
                placeholder={t('fields.areaNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.presentAddress')}</Label>
              <Textarea
                value={form.presentAddress}
                onChange={e => patch({ presentAddress: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.permanentAddress')}</Label>
              <Textarea
                value={form.permanentAddress}
                onChange={e => patch({ permanentAddress: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isExpat} onCheckedChange={v => patch({ isExpat: v })} />
              <Label>{t('fields.isExpat')}</Label>
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumSelect
              category="educationLevel"
              label={t('fields.educationLevel')}
              value={form.educationLevel}
              onChange={v => patch({ educationLevel: v })}
            />
            <EnumSelect
              category="profession"
              label={t('fields.professionKey')}
              value={form.professionKey}
              onChange={v => patch({ professionKey: v })}
            />
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.educationDetails')}</Label>
              <Textarea
                value={form.educationDetails}
                onChange={e => patch({ educationDetails: e.target.value })}
                rows={3}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.professionDetails')}</Label>
              <Textarea
                value={form.professionDetails}
                onChange={e => patch({ professionDetails: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.monthlyIncomeBdt')}</Label>
              <Input
                type="number"
                value={form.monthlyIncomeBdt}
                onChange={e => patch({ monthlyIncomeBdt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.languages')}</Label>
              <Input
                value={form.languages}
                onChange={e => patch({ languages: e.target.value })}
                placeholder="Bengali, English"
              />
            </div>
          </div>
        );
      case 'family':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Switch checked={form.fatherAlive} onCheckedChange={v => patch({ fatherAlive: v })} />
              <Label>{t('fields.fatherAlive')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.motherAlive} onCheckedChange={v => patch({ motherAlive: v })} />
              <Label>{t('fields.motherAlive')}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.fatherOccupation')}</Label>
              <Input
                value={form.fatherOccupation}
                onChange={e => patch({ fatherOccupation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.motherOccupation')}</Label>
              <Input
                value={form.motherOccupation}
                onChange={e => patch({ motherOccupation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.brothersCount')}</Label>
              <Input
                type="number"
                value={form.brothersCount}
                onChange={e => patch({ brothersCount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.sistersCount')}</Label>
              <Input
                type="number"
                value={form.sistersCount}
                onChange={e => patch({ sistersCount: e.target.value })}
              />
            </div>
            <EnumSelect
              category="familyStatus"
              label={t('fields.familyStatus')}
              value={form.familyStatus}
              onChange={v => patch({ familyStatus: v })}
            />
            <EnumSelect
              category="familyValues"
              label={t('fields.familyValues')}
              value={form.familyValues}
              onChange={v => patch({ familyValues: v })}
            />
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.familyDetails')}</Label>
              <Textarea
                value={form.familyDetails}
                onChange={e => patch({ familyDetails: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
      case 'health':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.hasHealthIssues}
                onCheckedChange={v => patch({ hasHealthIssues: v })}
              />
              <Label>{t('fields.hasHealthIssues')}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t('fields.healthDetails')}</Label>
              <Textarea
                value={form.healthDetails}
                onChange={e => patch({ healthDetails: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('fields.aboutMe')}</Label>
              <Textarea
                value={form.aboutMe}
                onChange={e => patch({ aboutMe: e.target.value })}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.partnerExpectation')}</Label>
              <Textarea
                value={form.partnerExpectation}
                onChange={e => patch({ partnerExpectation: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.futureGoals')}</Label>
              <Textarea
                value={form.futureGoals}
                onChange={e => patch({ futureGoals: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        );
      case 'deen':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumSelect
              category="aqidah"
              label={t('fields.aqidah')}
              value={form.aqidah}
              onChange={v => patch({ aqidah: v })}
            />
            <EnumSelect
              category="madhhab"
              label={t('fields.madhhab')}
              value={form.madhhab}
              onChange={v => patch({ madhhab: v })}
            />
            <EnumSelect
              category="prayerFrequency"
              label={t('fields.prayerFrequency')}
              value={form.prayerFrequency}
              onChange={v => patch({ prayerFrequency: v })}
            />
            {showField('MALE') && (
              <EnumSelect
                category="beardStyle"
                label={t('fields.beardStyle')}
                value={form.beardStyle}
                onChange={v => patch({ beardStyle: v })}
              />
            )}
            {showField('FEMALE') && (
              <EnumSelect
                category="hijabStyle"
                label={t('fields.hijabStyle')}
                value={form.hijabStyle}
                onChange={v => patch({ hijabStyle: v })}
              />
            )}
            <EnumSelect
              category="quranMemorization"
              label={t('fields.quranMemorization')}
              value={form.quranMemorization}
              onChange={v => patch({ quranMemorization: v })}
            />
            <EnumSelect
              category="quranRecitation"
              label={t('fields.quranRecitation')}
              value={form.quranRecitation}
              onChange={v => patch({ quranRecitation: v })}
            />
            <EnumSelect
              category="viewsOnLoans"
              label={t('fields.viewsOnLoans')}
              value={form.viewsOnLoans}
              onChange={v => patch({ viewsOnLoans: v })}
            />
            <EnumSelect
              category="polygynyPreference"
              label={t('fields.polygynyPreference')}
              value={form.polygynyPreference}
              onChange={v => patch({ polygynyPreference: v })}
            />
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.islamicEducation')}</Label>
              <Textarea
                value={form.islamicEducation}
                onChange={e => patch({ islamicEducation: e.target.value })}
                rows={2}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.deenPracticeDetails')}</Label>
              <Textarea
                value={form.deenPracticeDetails}
                onChange={e => patch({ deenPracticeDetails: e.target.value })}
                rows={3}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.marriageExpectations')}</Label>
              <Textarea
                value={form.marriageExpectations}
                onChange={e => patch({ marriageExpectations: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        );
      case 'lifestyle':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumSelect
              category="smokingHabit"
              label={t('fields.smoking')}
              value={form.smoking}
              onChange={v => patch({ smoking: v })}
            />
            <EnumSelect
              category="drinkingHabit"
              label={t('fields.drinking')}
              value={form.drinking}
              onChange={v => patch({ drinking: v })}
            />
            <EnumSelect
              category="dietPreference"
              label={t('fields.diet')}
              value={form.diet}
              onChange={v => patch({ diet: v })}
            />
            <div className="space-y-2">
              <Label>{t('fields.interests')}</Label>
              <Input value={form.interests} onChange={e => patch({ interests: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.hobbies')}</Label>
              <Input value={form.hobbies} onChange={e => patch({ hobbies: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.careerGoals')}</Label>
              <Textarea
                value={form.careerGoals}
                onChange={e => patch({ careerGoals: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        );
      case 'guardian':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.waliName')}</Label>
              <Input value={form.waliName} onChange={e => patch({ waliName: e.target.value })} />
            </div>
            <EnumSelect
              category="guardianRelation"
              label={t('fields.waliRelation')}
              value={form.waliRelation}
              onChange={v => patch({ waliRelation: v })}
            />
            <div className="space-y-2">
              <Label>{t('fields.waliPhone')}</Label>
              <Input value={form.waliPhone} onChange={e => patch({ waliPhone: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch
                checked={form.waliApproves}
                onCheckedChange={v => patch({ waliApproves: v })}
              />
              <Label>{t('fields.waliApproves')}</Label>
            </div>
          </div>
        );
      case 'partner':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.ageMin')}</Label>
              <Input
                type="number"
                value={form.ageMin}
                onChange={e => patch({ ageMin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.ageMax')}</Label>
              <Input
                type="number"
                value={form.ageMax}
                onChange={e => patch({ ageMax: e.target.value })}
              />
            </div>
            {mode === 'ISLAMIC' && (
              <>
                <EnumSelect
                  category="prayerFrequency"
                  label={t('fields.minPrayerFrequency')}
                  value={form.minPrayerFrequency}
                  onChange={v => patch({ minPrayerFrequency: v })}
                />
                <EnumSelect
                  category="hijabStyle"
                  label={t('fields.hijabExpectation')}
                  value={form.hijabExpectation}
                  onChange={v => patch({ hijabExpectation: v })}
                />
                <EnumSelect
                  category="viewsOnLoans"
                  label={t('fields.viewsOnLoansExpect')}
                  value={form.viewsOnLoansExpect}
                  onChange={v => patch({ viewsOnLoansExpect: v })}
                />
              </>
            )}
            <div className="flex items-center gap-2">
              <Switch
                checked={form.acceptsChildren}
                onCheckedChange={v => patch({ acceptsChildren: v })}
              />
              <Label>{t('fields.acceptsChildren')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.acceptsExpat}
                onCheckedChange={v => patch({ acceptsExpat: v })}
              />
              <Label>{t('fields.acceptsExpat')}</Label>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>{t('fields.otherExpectations')}</Label>
              <Textarea
                value={form.otherExpectations}
                onChange={e => patch({ otherExpectations: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.contactPhone')}</Label>
              <Input
                value={form.contactPhone}
                onChange={e => patch({ contactPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.contactEmail')}</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={e => patch({ contactEmail: e.target.value })}
              />
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumSelect
              category="profileVisibility"
              label={t('fields.visibility')}
              value={form.visibility}
              onChange={v => patch({ visibility: v })}
            />
            <EnumSelect
              category="photoPolicy"
              label={t('fields.photoPolicy')}
              value={form.photoPolicy}
              onChange={v => patch({ photoPolicy: v })}
            />
            <EnumSelect
              category="contactPolicy"
              label={t('fields.contactPolicy')}
              value={form.contactPolicy}
              onChange={v => patch({ contactPolicy: v })}
            />
            <div className="flex items-center gap-2">
              <Switch checked={form.hidePhone} onCheckedChange={v => patch({ hidePhone: v })} />
              <Label>{t('fields.hidePhone')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.hideLocation}
                onCheckedChange={v => patch({ hideLocation: v })}
              />
              <Label>{t('fields.hideLocation')}</Label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <nav className="lg:w-52 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {editorSections.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={cn(
              'text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
              active === s.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary text-muted-foreground',
            )}
          >
            {t(`sections.${s.id}`)}
          </button>
        ))}
      </nav>

      <div className="flex-1 glass-panel rounded-2xl p-5 md:p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t(`sections.${active}`)}</h2>
        {renderFields()}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-primary">{message}</p>}
        <div className="flex gap-2 pt-2">
          <Button onClick={save} disabled={saving}>
            {saving ? c('loading') : t('saveSection')}
          </Button>
        </div>
      </div>
    </div>
  );
}
