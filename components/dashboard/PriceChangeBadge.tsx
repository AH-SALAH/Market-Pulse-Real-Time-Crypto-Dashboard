import { cn } from '@/lib/cn';

interface PriceChangeBadgeProps {
  /** Signed percentage change over the period (e.g. 2.34 or -1.12) */
  value: number;
  className?: string;
}

function formatChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function PriceChangeBadge({ value, className }: PriceChangeBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums',
        isPositive && 'bg-emerald-500/10 text-emerald-400',
        isNegative && 'bg-red-500/10 text-red-400',
        !isPositive && !isNegative && 'bg-slate-500/10 text-slate-400',
        className,
      )}
      aria-label={`${formatChange(value)} over the period`}
    >
      <span aria-hidden="true">{isPositive ? '▲' : isNegative ? '▼' : '•'}</span>
      {formatChange(value)}
    </span>
  );
}
