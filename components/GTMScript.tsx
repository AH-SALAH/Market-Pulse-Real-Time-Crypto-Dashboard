'use client';

import { useEffect } from 'react';
import { CONSENT_STORAGE_KEY, DEFAULT_CONSENT } from '@/lib/analytics/consent';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const DEFAULT_CONSENT_JSON = JSON.stringify(DEFAULT_CONSENT);

// The stored choice is folded into the consent *default* rather than sent as a
// later 'update': gtm.js treats an 'update' received before it loads as implicit
// (denied), which is exactly the mismatch the Google Tag Assistant reported.
const consentDefaultsScript = `
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
var consentDefaults = ${DEFAULT_CONSENT_JSON};
try {
  var stored = JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}'));
  var hasAllModes = stored && typeof stored === 'object' &&
    (stored.ad_storage === 'granted' || stored.ad_storage === 'denied') &&
    (stored.analytics_storage === 'granted' || stored.analytics_storage === 'denied') &&
    (stored.ad_user_data === 'granted' || stored.ad_user_data === 'denied') &&
    (stored.ad_personalization === 'granted' || stored.ad_personalization === 'denied');
  if (hasAllModes) { consentDefaults = stored; }
} catch (e) {}
gtag('consent', 'default', consentDefaults);
window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
`.trim();

// The consent defaults must run before GTM. React never executes inline
// <script> elements rendered on the client (locale navigation re-renders this
// layout and would warn + skip execution), so inject both scripts via the DOM
// API in order. Module-scoped flag dedupes across layout remounts.
let injected = false;

export function GTMScript() {
  useEffect(() => {
    if (!gtmId || injected) return;
    injected = true;

    const consent = document.createElement('script');
    consent.id = 'gtm-consent-defaults';
    consent.textContent = consentDefaultsScript;
    document.head.appendChild(consent);

    const loader = document.createElement('script');
    loader.id = 'gtm-loader';
    loader.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    loader.async = true;
    document.head.appendChild(loader);
  }, []);

  return null;
}
