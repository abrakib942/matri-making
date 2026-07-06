'use client';

import {
  Bell,
  Compass,
  Heart,
  Home,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { dashboardApi } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';

const primaryNav = [
  { href: '/dashboard', icon: Home, labelKey: 'home' as const },
  { href: '/search', icon: Compass, labelKey: 'discover' as const },
  { href: '/recommendations', icon: Heart, labelKey: 'matches' as const },
  { href: '/my-profile', icon: User, labelKey: 'profile' as const },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common');
  const member = useTranslations('member');
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dashboardApi
      .get()
      .then((data: unknown) => {
        const d = data as { stats?: { unreadNotifications?: number }; unreadNotifications?: number };
        setUnread(d.stats?.unreadNotifications ?? d.unreadNotifications ?? 0);
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen mesh-hero flex flex-col">
      <SiteHeader minimal />

      <div className="border-b border-border/50 bg-background/60 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-4 py-3">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {primaryNav.map(item => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{member(item.labelKey)}</span>
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
