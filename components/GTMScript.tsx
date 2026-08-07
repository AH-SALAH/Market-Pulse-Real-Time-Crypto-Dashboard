'use client';

import { useEffect } from 'react';
import { CONSENT_STORAGE_KEY, DEFAULT_CONSENT } from '@/lib/analytics/consent';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;

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
    if (injected || (!gtmId && !ga4Id)) return;
    injected = true;

    // 1. Consent defaults must precede every tag loader.
    const consent = document.createElement('script');
    consent.id = 'gtm-consent-defaults';
    consent.textContent = consentDefaultsScript;
    document.head.appendChild(consent);

    // 2. GTM container (gtm.js), when configured.
    if (gtmId) {
      const loader = document.createElement('script');
      loader.id = 'gtm-loader';
      loader.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      loader.async = true;
      document.head.appendChild(loader);
    }

    // 3. Google tag (gtag.js) for the GA4 property, when configured. Mirrors
    // the standard snippet but keeps consent defaults ahead of the config so
    // the initial page_view carries the correct consent state. The config is
    // queued in the dataLayer and processed once gtag.js loads. gtm.js
    // consolidates the page's Google Tag (GT-NNMLKDT6) into its model, so
    // exactly one page_view fires despite the container also being present.
    if (ga4Id) {
      const ga4Loader = document.createElement('script');
      ga4Loader.id = 'ga4-loader';
      ga4Loader.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      ga4Loader.async = true;
      document.head.appendChild(ga4Loader);

      const ga4Init = document.createElement('script');
      ga4Init.id = 'ga4-init';
      ga4Init.textContent = `gtag('js', new Date());
gtag('config', '${ga4Id}');`.trim();
      document.head.appendChild(ga4Init);
    }
  }, []);

  return null;
}
