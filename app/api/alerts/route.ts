import { NextRequest, NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { createAlert, getAlerts } from '@/lib/db/alerts';

export async function GET() {
  const sessionId = await getSessionId();
  const items = await getAlerts(sessionId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();

  let coinId: string;
  let coinName: string;
  let targetPrice: number;
  let note: string | undefined;

  try {
    const body = (await request.json()) as {
      coinId?: unknown;
      coinName?: unknown;
      targetPrice?: unknown;
      note?: unknown;
    };
    if (typeof body.coinId !== 'string' || body.coinId.trim() === '') {
      return NextResponse.json({ error: 'coinId is required' }, { status: 400 });
    }
    if (typeof body.targetPrice !== 'number' || !Number.isFinite(body.targetPrice) || body.targetPrice <= 0) {
      return NextResponse.json({ error: 'targetPrice must be a positive number' }, { status: 400 });
    }
    coinId = body.coinId.trim().toLowerCase();
    coinName = typeof body.coinName === 'string' && body.coinName.trim() !== '' ? body.coinName.trim() : coinId;
    targetPrice = body.targetPrice;
    note = typeof body.note === 'string' && body.note.trim() !== '' ? body.note.trim() : undefined;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const alert = await createAlert(sessionId, { coinId, coinName, targetPrice, note });
  return NextResponse.json(alert, { status: 201 });
}
