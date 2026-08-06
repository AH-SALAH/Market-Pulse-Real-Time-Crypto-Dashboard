# Market Pulse

Real-time cryptocurrency market dashboard built with Next.js 16, React Query, Redux Toolkit, MongoDB Atlas, and GA4/GTM analytics.

## JD Skills Mapping

| JD Requirement | Implementation | Key Files |
|----------------|----------------|-----------|
| GA4/GTM Analytics | Consent Mode v2, virtual pageviews, 8-event taxonomy, PII redaction | `lib/analytics/`, `components/ConsentBanner.tsx`, `components/GTMScript.tsx` |
| React Query (TanStack v5) | Server state management, polling via `refetchInterval: 60000`, mutations | `hooks/useCoins.ts`, `hooks/useCoinDetail.ts`, `hooks/useWatchlist.ts` |
| Redux Toolkit | Client/UI state only (filters, sort, theme), `createSlice`, `configureStore` | `store/slices/filtersSlice.ts`, `store/index.ts` |
| Storybook | Every reusable component with 3+ states (default, loading, error/empty) | `components/**/*.stories.tsx` |
| NoSQL (Couchbase N1QL) | MongoDB Atlas with N1QL comment equivalents on every query | `lib/db/watchlist.ts`, `lib/db/alerts.ts` |
| Core Web Vitals | 90+ Lighthouse mobile, Next.js Image, code splitting | `PERFORMANCE.md` |
| i18n (EN/AR + RTL) | next-intl, locale routing, RTL layout | `messages/en.json`, `messages/ar.json`, middleware |

## Architecture

- **Server data** (coin prices, charts, watchlist) → React Query only
- **Client/UI state** (filters, sort, theme, modals) → Redux Toolkit only
- **No duplication** between the two — deliberate separation for interview talking point

## Data Source

CoinGecko Demo API (free signup) — proxied via Next.js Route Handlers to keep API key server-side:
- `GET /api/coins` → CoinGecko `/coins/markets?sparkline=true`
- `GET /api/coins/[id]/chart` → CoinGecko `/coins/{id}/market_chart`
- `GET|POST /api/watchlist`, `DELETE /api/watchlist/[coinId]` → anonymous-session watchlist CRUD

Polling via React Query `refetchInterval: 60000` simulates real-time without WebSockets.

## Database

MongoDB Atlas free tier for watchlists. Every query in `lib/db/` includes an N1QL comment equivalent for Couchbase interview readiness. The Mongo client connects lazily (`lib/db/client.ts`) and every watchlist query falls back to an in-memory store until a real `DB_CONNECTION_STRING` is set — so the app is fully demoable without a cluster, and dropping in a connection string enables durable persistence with zero code changes.

**Next step:** price alerts (`lib/db/alerts.ts` + API route, `price_alert_created` event) — same session-scoped pattern.

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

Vercel-ready. Connect repo, add env vars, deploy.