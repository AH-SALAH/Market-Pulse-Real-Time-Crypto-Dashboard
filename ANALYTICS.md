# ANALYTICS.md — Market Pulse Event Taxonomy

Single source of truth: `lib/analytics/events.ts`. Every event is pushed via `pushToDataLayer()` (`lib/analytics/dataLayer.ts`). Free-text params are passed through `redactPII()` (`lib/analytics/redactPII.ts`) before push — email and phone patterns become `[redacted]`.

## Consent Model (Consent Mode v2)

- Default state on every page load (set synchronously in `components/GTMScript.tsx` before GTM loads): `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` all `denied`.
- `components/ConsentBanner.tsx` shows accept / reject / customize. Only an explicit choice updates consent to `granted` (or selectively, for custom) and persists the choice in `localStorage` (`mp-consent`).
- On subsequent visits the stored choice is re-applied via `gtag('consent', 'update', state)` before GTM fires.
- No GA4/GTM tag fires with full data until consent is granted.

## Events

| Event | Trigger | Parameters |
|-------|---------|------------|
| `virtual_pageview` | Every route change (`hooks/useVirtualPageview.ts`, via `usePathname`/`useSearchParams`) | `page_path`, `page_title` |
| `coin_selected` | Click/keyboard-activate on a coin card (`components/dashboard/CoinCard.tsx`) | `coin_id`, `coin_name`, `coin_symbol` |
| `watchlist_added` | Add-to-watchlist button on coin card / detail page | `coin_id`, `coin_name` |
| `filter_applied` | Sort dropdown change or search input (`components/dashboard/FilterBar.tsx`) | `filter_type` (`sort`/`search`), `filter_value` (redacted) |
| `chart_range_changed` | 1D/7D/30D range button on detail page (`components/dashboard/RangeSelector.tsx`) | `coin_id`, `days` |
| `price_alert_created` | Price alert form submit on detail page | `coin_id`, `target_price`, `note` (redacted, optional) |
| `search_performed` | Debounced search input (300ms) — wired in Phase 5 (T041) | `search_term` (redacted) |

## Naming Convention

Event names are lowercase snake_case (`coin_selected`, not `coinClick`) so GTM/GA4 property names match the codebase 1:1 and custom event names in GA4 need no remapping. Params are `snake_case` keys matching the GA4 `event_parameters` convention.

## Verifying

1. Open GTM Preview Mode (`https://tagmanager.google.com` → Preview) for the container id in `NEXT_PUBLIC_GTM_ID`.
2. Open GA4 DebugView (`https://analytics.google.com` → Admin → DebugView).
3. Reload the app. With consent denied, expect no `ga4_*` tags firing. Accept consent, then interact; events appear within seconds.
