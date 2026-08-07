'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Popover from '@mui/material/Popover';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { cn } from '@/lib/cn';
import { useAlerts, useCreateAlert, useDeleteAlert } from '@/hooks/useAlerts';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

interface PriceAlertButtonProps {
  coinId: string;
  coinName: string;
  /** Current price of the coin — used as a hint/default for the target price. */
  currentPrice: number;
  className?: string;
  /** Show a text label next to the icon (detail page). Icon-only by default. */
  label?: string;
}

export function PriceAlertButton({
  coinId,
  coinName,
  currentPrice,
  className,
  label,
}: PriceAlertButtonProps) {
  const t = useTranslations('PriceAlert');
  const locale = useLocale();
  const { data: alerts, isLoading } = useAlerts();
  const createMutation = useCreateAlert();
  const deleteMutation = useDeleteAlert();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [note, setNote] = useState('');

  const open = Boolean(anchorEl);
  const coinAlerts = alerts?.filter((alert) => alert.coinId === coinId) ?? [];
  const pending = createMutation.isPending || deleteMutation.isPending;

  // Popover origin is physical (left/right), not logical — map locale so the
  // panel aligns to the logical "end" edge like the old `end-0` utility did.
  const end = locale === 'ar' ? 'left' : 'right';

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(targetPrice);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    createMutation.mutate(
      { coinId, coinName, targetPrice: parsed, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setTargetPrice('');
          setNote('');
          setAnchorEl(null);
        },
      },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('aria', { coin: coinName })}
        title={t('title')}
        disabled={isLoading}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
          className,
        )}
      >
        <NotificationsNoneIcon sx={{ fontSize: 16 }} aria-hidden="true" />
        {label && <span>{label}</span>}
        {coinAlerts.length > 0 && (
          <span className="rounded-full bg-blue-500/20 px-1.5 text-[10px] font-semibold text-blue-400">
            {coinAlerts.length}
          </span>
        )}
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: end }}
        transformOrigin={{ vertical: 'top', horizontal: end }}
        slotProps={{
          paper: {
            className:
              'mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-xl backdrop-blur',
          },
        }}
      >
        <div role="region" aria-label={t('regionAria', { coin: coinName })}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs text-slate-400">
              {t('currentPrice')}
              <span className="mt-0.5 block font-mono tabular-nums text-sm text-slate-200">
                ${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </label>
            <label className="block text-xs text-slate-400">
              {t('targetPrice')}
              <input
                type="number"
                step="any"
                min="0"
                value={targetPrice}
                onChange={(event) => setTargetPrice(event.target.value)}
                placeholder={t('targetPlaceholder', { price: currentPrice })}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1.5 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500"
                aria-label={t('targetPrice')}
              />
            </label>
            <label className="block text-xs text-slate-400">
              {t('note')}
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t('notePlaceholder')}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500"
                aria-label={t('note')}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 cursor-pointer disabled:cursor-wait disabled:opacity-60"
            >
              {createMutation.isPending ? t('saving') : t('create')}
            </button>
            {createMutation.isError && (
              <p role="alert" className="text-xs text-red-400">
                {t('createError')}
              </p>
            )}
          </form>

          {coinAlerts.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-800 pt-3" aria-label={t('listAria')}>
              {coinAlerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-mono tabular-nums text-slate-200">
                    ${alert.targetPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(alert.id)}
                    disabled={pending}
                    aria-label={t('deleteAria', {
                      price: alert.targetPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }),
                    })}
                    className="text-xs text-slate-500 transition-colors hover:text-red-400 disabled:opacity-60 cursor-pointer"
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} aria-hidden="true" titleAccess={t('delete')} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Popover>
    </>
  );
}
