import { SiteHeader } from '@/components/layout/site-header';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mesh-hero flex flex-col">
      <SiteHeader minimal />
      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md glass-panel p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
