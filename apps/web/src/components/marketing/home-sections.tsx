'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  CheckCircle2,
  Heart,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  Search,
  Handshake,
  PartyPopper,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/ui/section';

export function TrustBar() {
  const t = useTranslations('home');
  const items = [
    { icon: Shield, text: t('trustVerified') },
    { icon: Heart, text: t('trustPrivacy') },
    { icon: Users, text: t('trustFamily') },
  ];

  return (
    <section className="border-y bg-card/50">
      <div className="container py-8 flex flex-col md:flex-row justify-center gap-8 md:gap-16">
        {items.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 justify-center text-sm font-medium">
            <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden />
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrustFooterBand() {
  const t = useTranslations('home');
  const badges = [t('trustVerified'), t('trustPrivacy'), t('trustFreeBiodata')];

  return (
    <section className="bg-primary/5 border-y">
      <div className="container py-8 flex flex-wrap justify-center gap-6 md:gap-10">
        {badges.map(b => (
          <div key={b} className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
            {b}
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const t = useTranslations('home');
  const steps = [
    { title: t('step1'), desc: t('step1Desc'), icon: UserPlus },
    { title: t('step2'), desc: t('step2Desc'), icon: Search },
    { title: t('step3'), desc: t('step3Desc'), icon: Handshake },
    { title: t('step4'), desc: t('step4Desc'), icon: PartyPopper },
  ];

  return (
    <Section spacing="md">
      <div className="container">
        <h2 className="text-h2 text-center mb-12">{t('howItWorks')}</h2>
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div
            className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-border"
            aria-hidden
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center space-y-3"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md relative z-10">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function FeaturesGrid() {
  const t = useTranslations('home');
  const features = [
    { title: t('featureCompatibility'), desc: t('featureCompatibilityDesc'), icon: Brain },
    { title: t('featureGreenFlags'), desc: t('featureGreenFlagsDesc'), icon: CheckCircle2 },
    { title: t('featureReadiness'), desc: t('featureReadinessDesc'), icon: Heart },
    { title: t('featureFamily'), desc: t('featureFamilyDesc'), icon: Users },
  ];

  return (
    <Section spacing="md" className="bg-muted/30">
      <div className="container">
        <h2 className="text-h2 text-center mb-12">{t('featuresTitle')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function PricingTeaser() {
  const t = useTranslations('home');
  const c = useTranslations('common');

  return (
    <Section spacing="md">
      <div className="container max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">{c('free')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ {t('pricingFree1')}</li>
                <li>✓ {t('pricingFree2')}</li>
                <li>✓ {t('pricingFree3')}</li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">{c('getStarted')}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">{c('premium')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ {t('pricingPremium1')}</li>
                <li>✓ {t('pricingPremium2')}</li>
                <li>✓ {t('pricingPremium3')}</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/pricing">{c('learnMore')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
