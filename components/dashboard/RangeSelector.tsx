'use client';

import { useTranslations } from 'next-intl';
import { chart_range_changed } from '@/lib/analytics/events';
import { cn } from '@/lib/cn';

export interface RangeOption {
  label: string;
  days: number;
}

interface RangeSelectorProps {
  coinId: string;
  value: number;
  onChange: (days: number) => void;
}

export function RangeSelector({ coinId, value, onChange }: RangeSelectorProps) {
  const t = useTranslations('RangeSelector');

  const RANGE_OPTIONS: RangeOption[] = [
    { label: t('day1'), days: 1 },
    { label: t('day7'), days: 7 },
    { label: t('day30'), days: 30 },
  ];

  function handleSelect(days: number) {
    if (days === value) return;
    chart_range_changed({ coin_id: coinId, days });
    onChange(days);
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1"
      role="group"
      aria-label={t('aria')}
    >
      {RANGE_OPTIONS.map((option) => {
        const active = option.days === value;
        return (
          <button
            key={option.days}
            type="button"
            onClick={() => handleSelect(option.days)}
            aria-pressed={active}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-blue-500 text-slate-950'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
