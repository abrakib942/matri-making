'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/navigation';
import { authApi } from '@/lib/api/endpoints';

type Step = 'forgot' | 'reset';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const c = useTranslations('common');

  const [step, setStep] = useState<Step>('forgot');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess('If an account exists, a reset code has been sent to your email.');
      setStep('reset');
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setSuccess('Password reset successfully. You can now log in.');
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{step === 'forgot' ? t('forgotPassword') : t('resetTitle')}</CardTitle>
        <CardDescription>
          {step === 'forgot'
            ? 'Enter your email to receive a reset code.'
            : 'Enter the code from your email and choose a new password.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'forgot' ? (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? c('loading') : c('continue')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">{t('otp')}</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('password')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? c('loading') : t('resetTitle')}
            </Button>
          </form>
        )}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary hover:underline">
            {c('back')} to {c('login')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
