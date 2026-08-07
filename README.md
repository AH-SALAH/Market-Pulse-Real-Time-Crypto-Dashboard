# Market Pulse

Real-time cryptocurrency market dashboard built with Next.js 16, React Query, Redux Toolkit, MUI, MongoDB Atlas, and GA4/GTM analytics.

## JD Skills Mapping

| JD Requirement | Implementation | Key Files |
|----------------|----------------|-----------|
| GA4/GTM Analytics | Consent Mode v2, virtual pageviews, 8 wired events, PII redaction | `lib/analytics/events.ts`, `lib/analytics/redactPII.ts`, `components/ConsentBanner.tsx`, `components/GTMScript.tsx`, `hooks/useVirtualPageview.ts` |
| React Query (TanStack v5) | Server state only, polling via `refetchInterval: 60000`, mutations with optimistic updates | `hooks/useCoins.ts`, `hooks/useCoinDetail.ts`, `hooks/useWatchlist.ts`, `hooks/useAlerts.ts` |
| Redux Toolkit | Client/UI state only (search, sort), `createSlice`, `configureStore` | `store/slices/filtersSlice.ts`, `store/index.ts` |
| Storybook | Reusable components with multiple states, a11y-tested via vitest runner | `components/**/*.stories.tsx` (26 stories), `.storybook/preview.tsx` |
| NoSQL (Couchbase N1QL) | MongoDB Atlas, N1QL comment equivalent on every query | `lib/db/watchlist.ts`, `lib/db/alerts.ts`, `lib/db/client.ts` |
| MUI (Material UI) | `Popover` for the price-alert panel, `@mui/icons-material` for all UI icons | `components/dashboard/PriceAlertButton.tsx`, `components/dashboard/WatchlistButton.tsx`, `components/dashboard/FilterBar.tsx`, `components/dashboard/PriceChangeBadge.tsx` |
| Core Web Vitals | Lighthouse mobile 96/100/100, `next/image`, tree-shaken d3, verified code-splitting | `PERFORMANCE.md` |
| i18n (EN/AR + RTL) | next-intl v4, locale-prefixed routing, RTL layout, Arabic font | `i18n/`, `messages/en.json`, `messages/ar.json`, `proxy.ts` |

## Architecture

- **Server data** (coin prices, charts, watchlist, alerts) → React Query only
- **Client/UI state** (search, sort) → Redux Toolkit only
- **No duplication** between the two — deliberate separation for interview talking point

```
app/[locale]/          # Locale-prefixed routes (/en, /ar) via next-intl
  api/                 # CoinGecko proxy + watchlist/alerts CRUD (API key stays server-side)
  coin/[id]/           # Coin detail page (D3 chart + price alerts)
  watchlist/           # Watchlist page
components/
  dashboard/           # Feature components (CoinCard, CoinList, FilterBar, PriceChart…)
  ui/                  # Design-system components (Storybook-covered)
hooks/                 # React Query hooks (server state)
store/slices/          # Redux Toolkit (client state)
lib/
  coingecko.ts         # API client
  db/                  # MongoDB + N1QL comments
  analytics/           # GTM dataLayer, event taxonomy, PII redaction
i18n/ + messages/      # next-intl routing + EN/AR catalogs
```

MUI (Material UI v9, `@mui/material` + `@mui/icons-material`) provides the popover container and icon set; styling stays Tailwind-first with MUI components composed inside the existing utility classes.

## Data Source

CoinGecko Demo API (free signup) — proxied via Next.js Route Handlers to keep API key server-side:
- `GET /api/coins` → CoinGecko `/coins/markets?sparkline=true`
- `GET /api/coins/[id]/chart` → CoinGecko `/coins/{id}/market_chart`
- `GET|POST /api/watchlist`, `DELETE /api/watchlist/[coinId]` → anonymous-session watchlist CRUD
- `GET|POST /api/alerts`, `DELETE /api/alerts/[id]` → anonymous-session price-alert CRUD

Polling via React Query `refetchInterval: 60000` simulates real-time without WebSockets.

## Database

MongoDB Atlas free tier for watchlists and price alerts. Every query in `lib/db/` includes an N1QL comment equivalent for Couchbase interview readiness. The Mongo client connects lazily (`lib/db/client.ts`) and every watchlist/alert query falls back to an in-memory store until a real `DB_CONNECTION_STRING` is set — so the app is fully demoable without a cluster, and dropping in a connection string enables durable persistence with zero code changes.

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run storybook    # Storybook dev server
```

## Documentation

- `ANALYTICS.md` — Event taxonomy (name, trigger, params)
- `BIGQUERY.md` — GA4→BigQuery linking steps + sample SQL
- `PERFORMANCE.md` — Lighthouse before/after + CWV numbers

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
```
COINGECKO_API_KEY=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA4_ID=
DB_CONNECTION_STRING=
```

## Deployment

Vercel-ready. Connect the repo in the Vercel dashboard (or `npx vercel`), add the env vars, and deploy.