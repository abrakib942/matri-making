import { redirect } from 'next/navigation';
import { getServerSideCookies } from '@/libs/auth-server';
import LoginPageClient from './login-page-client';

export default async function LoginPage() {
  // Server-side check: if already authenticated, redirect to home
  const cookieData = await getServerSideCookies();

  if (cookieData && cookieData.user && cookieData.accessToken && cookieData.accessType) {
    redirect('/');
  }

  return <LoginPageClient />;
}
