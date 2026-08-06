'use client';

import { useVirtualPageview } from '@/hooks/useVirtualPageview';

export function PageViewTracker() {
  useVirtualPageview();
  return null;
}
