import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: 'LifeMat — Modern Matrimony', template: '%s | LifeMat' },
  description: 'Find your life partner with trust, compatibility, and privacy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
