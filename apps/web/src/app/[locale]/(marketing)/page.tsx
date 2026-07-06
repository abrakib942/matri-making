import { EditorialHero } from '@/components/marketing/editorial-hero';
import { PhilosophyStrip } from '@/components/marketing/philosophy-strip';
import { JourneyNarrative } from '@/components/marketing/journey-narrative';
import { CompatibilityBento } from '@/components/marketing/compatibility-bento';
import { CuratedMatches } from '@/components/marketing/curated-matches';
import { DualPathPanels, SoftCta } from '@/components/marketing/dual-path-panels';
import { SuccessStoriesSection } from '@/components/marketing/success-stories-section';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: t('appName'),
    description: t('tagline'),
    openGraph: { title: t('appName'), description: t('tagline') },
  };
}

export default function HomePage() {
  return (
    <>
      <EditorialHero />
      <PhilosophyStrip />
      <JourneyNarrative />
      <CompatibilityBento />
      <DualPathPanels />
      <CuratedMatches />
      <SuccessStoriesSection />
      <SoftCta />
    </>
  );
}
