'use client';

import { Globe, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function SettingsPage() {
  const nav = useTranslations('nav');
  const c = useTranslations('common');
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const next = locale === 'bn' ? 'en' : 'bn';
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{nav('settings')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4" />
            Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
          >
            System
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Language</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2" onClick={switchLocale}>
            <Globe className="h-4 w-4" />
            {locale === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => logout()}>
            {c('logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
