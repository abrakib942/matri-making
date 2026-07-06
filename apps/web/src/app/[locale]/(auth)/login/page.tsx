'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function LoginPage() {
  const t = useTranslations('auth');
  const c = useTranslations('common');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace(returnUrl);
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{t('loginTitle')}</CardTitle>
        <CardDescription>{c('tagline')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? c('loading') : c('login')}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-primary hover:underline">
            {c('register')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
