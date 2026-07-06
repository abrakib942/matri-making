'use client';

import { Moon, Sun, Menu } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  minimal?: boolean;
}

const marketingLinks = [
  { href: '/pricing', key: 'pricing' as const },
  { href: '/success-stories', key: 'successStories' as const },
  { href: '/about', key: 'about' as const },
];

export function SiteHeader({ minimal }: SiteHeaderProps = {}) {
  const t = useTranslations('common');
  const nav = useTranslations('nav');
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const switchLocale = () => {
    const next = locale === 'bn' ? 'en' : 'bn';
    router.replace(pathname, { locale: next });
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="container flex h-16 md:h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-tight">
            LM
          </span>
          <span className="hidden sm:inline font-semibold tracking-tight font-bengali">
            {t('appName')}
          </span>
        </Link>

        {!minimal && (
          <nav className="hidden lg:flex nav-pill">
            {marketingLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={cn('nav-pill-link', pathname.startsWith(href) && 'nav-pill-link-active')}
              >
                {nav(key)}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {!minimal && (
            <>
              {isAuthenticated ? (
                <Button asChild size="sm" className="hidden md:inline-flex rounded-full">
                  <Link href="/dashboard">{t('dashboard')}</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden md:inline-flex rounded-full"
                  >
                    <Link href="/login">{t('login')}</Link>
                  </Button>
                  <Button asChild size="sm" className="hidden md:inline-flex rounded-full">
                    <Link href="/register">{t('register')}</Link>
                  </Button>
                </>
              )}
            </>
          )}

          <button
            type="button"
            onClick={switchLocale}
            className="hidden sm:flex h-9 items-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Switch language"
          >
            {locale === 'bn' ? 'EN' : 'বাং'}
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {!minimal && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated && minimal && (
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => logout()}>
              {t('logout')}
            </Button>
          )}
        </div>
      </div>

      {!minimal && mobileOpen && (
        <div className="lg:hidden border-t border-border/60 glass-panel mx-4 mb-4 rounded-2xl p-4 flex flex-col gap-2 animate-fade-in">
          {marketingLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-4 py-3 text-sm hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {nav(key)}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm"
              >
                {t('dashboard')}
              </Link>
              <button
                type="button"
                className="rounded-xl px-4 py-3 text-sm text-left"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-primary"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
