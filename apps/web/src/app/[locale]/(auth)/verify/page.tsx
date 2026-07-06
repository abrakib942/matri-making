'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/i18n/navigation';
import { authApi } from '@/lib/api/endpoints';
import { storeTokens } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';

export default function VerifyPage() {
  const t = useTranslations('auth');
  const c = useTranslations('common');
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const router = useRouter();
  const { setUser } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await authApi.verifyOtp({ email, otp, purpose: 'REGISTRATION' });
      storeTokens(data);
      setUser(data.user);
      router.replace('/choose-mode');
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authApi.resendOtp({ email, purpose: 'REGISTRATION' });
    } catch {
      /* ignore */
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{t('verifyTitle')}</CardTitle>
        <CardDescription>
          {t('verifyDesc')}
          {email && (
            <>
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">{t('otp')}</Label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              className="text-center text-lg tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? c('loading') : c('continue')}
          </Button>
        </form>
        <div className="flex flex-col items-center gap-2 mt-6 text-sm">
          <Button type="button" variant="link" onClick={handleResend} disabled={resending || !email}>
            {resending ? c('loading') : t('resendOtp')}
          </Button>
          <Link href="/login" className="text-muted-foreground hover:underline">
            {c('back')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
