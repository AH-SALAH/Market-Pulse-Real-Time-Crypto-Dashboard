// Anonymous session id — no auth (PLAN.md §4.7). A UUID in an httpOnly cookie
// keys the watchlist server-side. Only usable in Route Handlers / Server
// Components (cookies() is async and request-time only).

import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'mp-session';

const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
  return id;
}
