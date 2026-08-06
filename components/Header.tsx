'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Markets', href: '/' },
  { label: 'Watchlist', href: '/watchlist' },
] as const;

export function Header() {
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
          Market Pulse
        </Link>

        <nav className="flex items-center gap-1 text-sm" aria-label="Main navigation">
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
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
