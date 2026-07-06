'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { EnumSelect } from '@/components/shared/enum-select';
import { LocationPicker } from '@/components/shared/location-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Moon, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function HeroSearch() {
  const t = useTranslations('home');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('35');
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [professionKey, setProfessionKey] = useState('');

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (gender) params.set('gender', gender);
    if (maritalStatus) params.set('maritalStatus', maritalStatus);
    if (ageMin) params.set('ageMin', ageMin);
    if (ageMax) params.set('ageMax', ageMax);
    if (districtId) params.set('districtId', String(districtId));
    else if (divisionId) params.set('divisionId', String(divisionId));
    if (professionKey) params.set('professionKey', professionKey);
    return params.toString();
  };

  const handleSearch = () => {
    const qs = buildQuery();
    if (isAuthenticated) {
      router.push(`/search${qs ? `?${qs}` : ''}`);
    } else {
      router.push(`/register?returnUrl=${encodeURIComponent(`/search?${qs}`)}`);
    }
  };

  return (
    <section className="gradient-hero islamic-pattern relative overflow-hidden">
      <div className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <Accordion type="single" collapsible className="md:hidden">
            <AccordionItem value="hadith" className="border-none">
              <AccordionTrigger className="text-sm text-muted-foreground py-2 hover:no-underline">
                {t('hadithQuote')}
              </AccordionTrigger>
              <AccordionContent className="text-sm italic text-muted-foreground">
                {t('hadithText')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <blockquote className="hidden md:block text-center text-sm italic text-muted-foreground max-w-2xl mx-auto border-l-0 px-4">
            <p>{t('hadithText')}</p>
          </blockquote>

          <div className="text-center space-y-4">
            <h1 className="text-display text-balance font-bengali leading-relaxed">
              {t('heroTitle')}
            </h1>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">{t('heroSubtitle')}</p>
          </div>

          <div className="rounded-2xl border bg-card/90 backdrop-blur-sm shadow-lg p-5 md:p-6 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">{t('heroSearchLabel')}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <EnumSelect
                category="gender"
                label={t('filterGender')}
                value={gender}
                onChange={setGender}
                placeholder={t('filterGender')}
              />
              <EnumSelect
                category="maritalStatus"
                label={t('filterMarital')}
                value={maritalStatus}
                onChange={setMaritalStatus}
                placeholder={t('filterMarital')}
              />
              <EnumSelect
                category="profession"
                label={t('filterProfession')}
                value={professionKey}
                onChange={setProfessionKey}
                placeholder={t('filterProfession')}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('filterAgeMin')}</Label>
                <Input
                  type="number"
                  min={18}
                  value={ageMin}
                  onChange={e => setAgeMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('filterAgeMax')}</Label>
                <Input
                  type="number"
                  max={80}
                  value={ageMax}
                  onChange={e => setAgeMax(e.target.value)}
                />
              </div>
            </div>
            <LocationPicker
              divisionId={divisionId}
              districtId={districtId}
              onDivisionChange={id => {
                setDivisionId(id);
                setDistrictId(null);
              }}
              onDistrictChange={setDistrictId}
            />
            <Button size="lg" className="w-full gap-2 text-base" onClick={handleSearch}>
              <Search className="h-5 w-5" />
              {t('searchCta')}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/islamic">
                <Moon className="h-4 w-4" />
                {t('ctaIslamic')}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/general">
                <Sparkles className="h-4 w-4" />
                {t('ctaGeneral')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
