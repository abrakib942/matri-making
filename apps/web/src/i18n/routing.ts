import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'bn',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
