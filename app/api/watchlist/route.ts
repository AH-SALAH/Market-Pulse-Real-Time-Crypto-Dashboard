import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { addToWatchlist, getWatchlist } from '@/lib/db/watchlist';

export async function GET() {
  const sessionId = await getSessionId();
  const items = await getWatchlist(sessionId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();

  let coinId: string;
  try {
    const body = (await request.json()) as { coinId?: unknown };
    if (typeof body.coinId !== 'string' || body.coinId.trim() === '') {
      return NextResponse.json({ error: 'coinId is required' }, { status: 400 });
    }
    coinId = body.coinId.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  await addToWatchlist(sessionId, coinId);
  const items = await getWatchlist(sessionId);
  return NextResponse.json(items, { status: 201 });
}
