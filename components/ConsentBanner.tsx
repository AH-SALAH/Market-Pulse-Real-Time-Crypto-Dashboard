'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_CONSENT,
  getStoredConsent,
  storeConsent,
  type ConsentState,
} from '@/lib/analytics/consent';

function applyConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('consent', 'update', state);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(['consent', 'update', state]);
}

const ALL_GRANTED: ConsentState = {
  ad_storage: 'granted',
  analytics_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
};

const ALL_DENIED: ConsentState = {
  ...DEFAULT_CONSENT,
};

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [adConsent, setAdConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    // Reveal only after hydration so SSR HTML never flashes the banner for returning users.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical mount-reveal pattern
    setVisible(getStoredConsent() === null);
  }, []);

  function choose(state: ConsentState) {
    storeConsent(state);
    applyConsent(state);
    setVisible(false);
  }

  function saveCustom() {
    choose({
      ad_storage: adConsent ? 'granted' : 'denied',
      analytics_storage: analyticsConsent ? 'granted' : 'denied',
      ad_user_data: adConsent ? 'granted' : 'denied',
      ad_personalization: adConsent ? 'granted' : 'denied',
    });
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-900/95 p-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm text-slate-300">
          <p className="font-medium text-slate-100">We value your privacy</p>
          <p className="mt-1">
            We use cookies to measure usage and improve the experience. Analytics only run
            after you consent.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {customizing ? (
            <div className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(event) => setAnalyticsConsent(event.target.checked)}
                />
                Analytics
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={adConsent}
                  onChange={(event) => setAdConsent(event.target.checked)}
                />
                Ads
              </label>
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-slate-950 transition-colors hover:bg-blue-400"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => choose(ALL_DENIED)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Reject all
              </button>
              <button
                type="button"
                onClick={() => choose(ALL_GRANTED)}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-slate-950 transition-colors hover:bg-blue-400"
              >
                Accept all
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
