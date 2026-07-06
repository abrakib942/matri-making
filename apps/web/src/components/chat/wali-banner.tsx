'use client';

import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function WaliBanner() {
  const t = useTranslations('chat');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
      <Shield className="h-4 w-4 shrink-0" aria-hidden />
      <p>{t('waliBanner')}</p>
    </div>
  );
}
