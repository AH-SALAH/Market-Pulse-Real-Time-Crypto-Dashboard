import { defineRouting } from 'next-intl/routing';

// Single source of truth for supported locales + default. Consumed by the
// proxy (locale negotiation), navigation wrappers and i18n/request.ts.
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});
