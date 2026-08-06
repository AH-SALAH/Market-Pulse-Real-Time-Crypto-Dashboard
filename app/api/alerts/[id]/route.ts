import { NextResponse } from 'next/server';
import { getSessionId } from '@/lib/session';
import { deleteAlert, getAlerts } from '@/lib/db/alerts';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionId = await getSessionId();

  await deleteAlert(sessionId, id);
  const items = await getAlerts(sessionId);
  return NextResponse.json(items);
}
