import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale negotiation + /[locale] prefix routing (Next 16 renamed the
// middleware convention to proxy). API routes and static assets are excluded.
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - /api, /trpc, /_next, /_vercel internals
  // - anything containing a dot (favicon.ico, images, etc.)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
