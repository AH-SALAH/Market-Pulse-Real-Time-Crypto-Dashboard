'use client';

import { cn } from '@/lib/cn';
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist } from '@/hooks/useWatchlist';

interface WatchlistButtonProps {
  coinId: string;
  coinName: string;
  className?: string;
  /** Show a text label next to the icon (detail page). Icon-only by default. */
  label?: string;
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
    >
      <path d="M6 3.5h12A1.5 1.5 0 0 1 19.5 5v15l-7.5-4.5-7.5 4.5V5A1.5 1.5 0 0 1 6 3.5Z" />
    </svg>
  );
}

export function WatchlistButton({ coinId, coinName, className, label }: WatchlistButtonProps) {
  const { data: watchlist, isLoading } = useWatchlist();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const watched = watchlist?.some((item) => item.coinId === coinId) ?? false;
  const pending = addMutation.isPending || removeMutation.isPending;

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    // Button sits inside <Link> cards/rows — don't trigger navigation or the
    // link's coin_selected handler.
    event.preventDefault();
    event.stopPropagation();

    if (pending) return;
    if (watched) {
      removeMutation.mutate({ coinId, coinName });
    } else {
      addMutation.mutate({ coinId, coinName });
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={watched}
      aria-label={watched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
      title={watched ? 'In watchlist' : 'Add to watchlist'}
      disabled={pending || isLoading}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
        watched
          ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300',
        pending && 'cursor-wait opacity-60',
        className,
      )}
    >
      <BookmarkIcon filled={watched} />
      {label && <span>{label}</span>}
    </button>
  );
}
