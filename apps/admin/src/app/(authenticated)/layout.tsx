import { requireAuth } from '@/libs/auth-server';
import Layout from '@/components/layout/layout';
import React from 'react';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check - protects all pages under (authenticated) route group
  await requireAuth();

  return <Layout title="Admin Panel">{children}</Layout>;
}
