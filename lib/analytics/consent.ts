export type ConsentMode =
  | 'ad_storage'
  | 'analytics_storage'
  | 'ad_user_data'
  | 'ad_personalization';

export type ConsentState = Record<ConsentMode, 'granted' | 'denied'>;

export const CONSENT_STORAGE_KEY = 'mp-consent';

export const DEFAULT_CONSENT: ConsentState = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};

export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    const hasAllModes = (Object.keys(DEFAULT_CONSENT) as ConsentMode[]).every(
      (mode) => parsed[mode] === 'granted' || parsed[mode] === 'denied',
    );
    return hasAllModes ? (parsed as ConsentState) : null;
  } catch {
    return null;
  }
}

export function storeConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
}
