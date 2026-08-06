'use client';

import { chart_range_changed } from '@/lib/analytics/events';
import { cn } from '@/lib/cn';

export interface RangeOption {
  label: string;
  days: number;
}

const RANGE_OPTIONS: RangeOption[] = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

interface RangeSelectorProps {
  coinId: string;
  value: number;
  onChange: (days: number) => void;
}

export function RangeSelector({ coinId, value, onChange }: RangeSelectorProps) {
  function handleSelect(days: number) {
    if (days === value) return;
    chart_range_changed({ coin_id: coinId, days });
    onChange(days);
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1"
      role="group"
      aria-label="Chart range"
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
