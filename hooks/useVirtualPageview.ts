'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';

export function useVirtualPageview(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    pushToDataLayer({
      event: 'virtual_pageview',
      page_path: pathname + (query ? `?${query}` : ''),
      page_title: typeof document !== 'undefined' ? document.title : '',
    });
  }, [pathname, searchParams]);
}
