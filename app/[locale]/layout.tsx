import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Arabic } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { StoreProvider } from '@/store/StoreProvider';
import { Providers } from '@/app/providers';
import { GTMScript } from '@/components/GTMScript';
import { ConsentBanner } from '@/components/ConsentBanner';
import { PageViewTracker } from '@/components/PageViewTracker';
import { Header } from '@/components/Header';
import { routing } from '@/i18n/routing';
import '../globals.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Arabic is not covered by the latin-only Geist subsets, so RTL locales load a
// dedicated Arabic face via the --font-arabic variable (applied in globals.scss).
const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: ['/favicon.svg', '/favicon.ico'],
      shortcut: '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const isRtl = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-slate-950 text-slate-50"
        suppressHydrationWarning
      >
        <GTMScript />
        <NextIntlClientProvider>
          <StoreProvider>
            <Providers>
              <Header />
              <Suspense>
                <PageViewTracker />
              </Suspense>
              {children}
            </Providers>
          </StoreProvider>
          <ConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
