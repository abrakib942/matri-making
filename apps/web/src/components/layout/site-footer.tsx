import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function SiteFooter() {
  const t = useTranslations('common');
  const nav = useTranslations('nav');

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-semibold text-lg mb-2">{t('appName')}</p>
          <p className="text-sm text-muted-foreground max-w-sm">{t('tagline')}</p>
        </div>
        <div>
          <p className="font-medium mb-3">{nav('home')}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/islamic" className="hover:text-foreground">
                {t('islamic')}
              </Link>
            </li>
            <li>
              <Link href="/general" className="hover:text-foreground">
                {t('general')}
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-foreground">
                {nav('pricing')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-3">{nav('help')}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground">
                {nav('about')}
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-foreground">
                {nav('help')}
              </Link>
            </li>
            <li>
              <Link href="/success-stories" className="hover:text-foreground">
                {nav('successStories')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LifeMat. All rights reserved.
      </div>
    </footer>
  );
}
