'use client';

import { Compass, Bell, Home, MessageCircle, Star, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { dashboardApi } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';

const primaryNav = [
  { href: '/dashboard', icon: Home, labelKey: 'home' as const },
  { href: '/search', icon: Compass, labelKey: 'discover' as const },
  { href: '/shortlist', icon: Star, labelKey: 'shortlist' as const },
  { href: '/messages', icon: MessageCircle, labelKey: 'messages' as const },
  { href: '/my-profile', icon: User, labelKey: 'profile' as const },
];

const guestPaths = ['/search', '/profiles'];

function isGuestAllowedPath(pathname: string) {
  return guestPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common');
  const member = useTranslations('member');
  const search = useTranslations('search');
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [mutualCount, setMutualCount] = useState(0);

  const guestAllowed = isGuestAllowedPath(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !guestAllowed) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, guestAllowed]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dashboardApi
      .get()
      .then((data: unknown) => {
        const d = data as {
          stats?: { unreadNotifications?: number };
          unreadNotifications?: number;
          mutualMatches?: { count?: number };
        };
        setUnread(d.stats?.unreadNotifications ?? d.unreadNotifications ?? 0);
        setMutualCount(d.mutualMatches?.count ?? 0);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center mesh-hero">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated && !guestAllowed) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen mesh-hero flex flex-col">
        <SiteHeader />
        <div className="border-b border-border/50 bg-primary/5">
          <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
            <p className="text-sm text-muted-foreground">{search('guestBanner')}</p>
            <div className="flex gap-2 shrink-0">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={`/login?returnUrl=${encodeURIComponent(pathname)}`}>{t('login')}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href={`/register?returnUrl=${encodeURIComponent(pathname)}`}>
                  {search('guestCreateCta')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <main className="flex-1 container py-6 md:py-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-hero flex flex-col">
      <SiteHeader minimal />

      <div className="border-b border-border/50 bg-background/60 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-4 py-3">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {primaryNav.map(item => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              const badge =
                item.href === '/notifications'
                  ? unread
                  : item.href === '/shortlist'
                    ? mutualCount
                    : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{member(item.labelKey)}</span>
                  {badge > 0 && item.href === '/shortlist' && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center px-1">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
              aria-label={member('notifications')}
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Avatar className="h-9 w-9 hidden sm:flex">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {user?.name?.slice(0, 2).toUpperCase() ?? 'LM'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-6 md:py-10 pb-24 md:pb-10">{children}</main>

      <nav className="md:hidden fixed bottom-4 inset-x-4 z-50">
        <div className="glass-panel flex justify-around py-2 px-1">
          {primaryNav.map(item => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-2 rounded-xl min-w-[4rem] text-[10px] font-medium',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                {member(item.labelKey)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
