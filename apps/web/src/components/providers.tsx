'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth/auth-context';
import { EnumProvider } from '@/lib/providers/enum-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <EnumProvider>
          {children}
          <Toaster richColors position="top-center" />
        </EnumProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
