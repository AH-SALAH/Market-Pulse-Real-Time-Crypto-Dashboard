import { NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { getWatchlist, removeFromWatchlist } from '@/lib/db/watchlist';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ coinId: string }> },
) {
  const { coinId } = await params;
  const sessionId = await getSessionId();

  await removeFromWatchlist(sessionId, coinId);
  const items = await getWatchlist(sessionId);
  return NextResponse.json(items);
}
