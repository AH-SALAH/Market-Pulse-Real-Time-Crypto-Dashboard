'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { key: 'markets', href: '/' },
  { key: 'watchlist', href: '/watchlist' },
] as const;

const LOCALES = ['en', 'ar'] as const;

// T067 — simple language switcher. Locale-aware navigation (usePathname strips
// the locale, useRouter.replace keeps you on the same page across languages).
function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: (typeof LOCALES)[number]) {
    if (target === locale) return;
    router.replace(pathname, { locale: target });
  }

  return (
    <div
      role="group"
      aria-label={t('aria')}
      className="ms-auto flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1"
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => switchTo(code)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-blue-500 text-slate-950'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            )}
          >
            {code === 'en' ? 'EN' : 'عربي'}
          </button>
        );
      })}
    </div>
  );
}

export function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-100">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-xs font-black text-slate-950"
            aria-hidden="true"
          >
            MP
          </span>
          {t('brand')}
        </Link>

        <nav className="flex items-center gap-1 text-sm" aria-label={t('navAria')}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  active
                    ? 'bg-slate-800 font-medium text-slate-100'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
