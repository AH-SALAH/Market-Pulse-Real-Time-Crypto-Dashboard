import { useId } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Sparkline.module.scss';
import { cn } from '@/lib/cn';

interface SparklineProps {
  /** Price series, oldest → newest (e.g. sparkline_in_7d.price) */
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

function toPoints(data: number[], width: number, height: number): string {
  if (data.length === 0) return '';
  if (data.length === 1) {
    return `${width / 2},${height / 2}`;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  return data
    .map((value, index) => {
      const x = pad + (index / (data.length - 1)) * innerW;
      const y = pad + (1 - (value - min) / span) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function Sparkline({ data, width = 104, height = 34, className }: SparklineProps) {
  const t = useTranslations('Sparkline');
  const gradientId = useId();
  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const isUp = trend > 0;
  const isDown = trend < 0;
  const trendLabel = isUp ? t('upward') : isDown ? t('downward') : t('flat');

  const points = toPoints(data, width, height);
  const area = points ? `0,${height} ${points} ${width},${height}` : '';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={t('aria', { trend: trendLabel })}
      className={cn(styles.sparkline, isUp && styles.up, isDown && styles.down, className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <polygon points={area} fill={`url(#${gradientId})`} />}
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
