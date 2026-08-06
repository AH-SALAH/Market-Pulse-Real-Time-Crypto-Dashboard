import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation wrappers. Use these everywhere instead of
// next/link / next/navigation so hrefs (and active-state pathnames) always
// include/strip the current locale correctly.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
