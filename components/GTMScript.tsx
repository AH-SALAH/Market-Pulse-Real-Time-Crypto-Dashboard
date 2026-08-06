import Script from 'next/script';
import { CONSENT_STORAGE_KEY, DEFAULT_CONSENT } from '@/lib/analytics/consent';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const DEFAULT_CONSENT_JSON = JSON.stringify(DEFAULT_CONSENT);

const consentDefaultsScript = `
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('consent', 'default', ${DEFAULT_CONSENT_JSON});
try {
  var stored = JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}'));
  if (stored) { gtag('consent', 'update', stored); }
} catch (e) {}
window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
`.trim();

export function GTMScript() {
  if (!gtmId) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: consentDefaultsScript }} />
      <Script
        id="gtm-loader"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
