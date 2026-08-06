# Performance

Core Web Vitals + Lighthouse measurements for Market Pulse, before and after the Phase 10 polish pass. All numbers are **lab** metrics captured in headless Chrome against a local production build (`npm run build && npm run start`), emulating a mid-tier mobile device (Fast 3G network, 4× CPU throttle). Field/CrUX data is N/A until the site is deployed with real traffic.

## Before (Phase 10 start — plain `<img>`, `import * as d3` barrel)

| Route | LCP | INP | CLS | Notes |
|---|---|---|---|---|
| `/en` (Markets) | 719 ms | — | 0.00 | LCP = coin list text |
| `/en/coin/bitcoin` | 712 ms | — | 0.01 | LCP = detail heading |
| `/en/watchlist` | 2590 ms | — | 0.00 | LCP = empty-state text; render delay 2.59 s |

Lighthouse category scores (mobile, `/en`): **Accessibility 95 · Best Practices 100 · SEO 92**.

Bundle: `d3` barrel (`import * as d3 from 'd3'`) pulled the entire d3 monorepo into a single ~79 KB chunk — all 30+ submodules regardless of usage.

## What changed (Phase 10)

1. **`next/image` for coin icons** — CoinCard, CoinDetailView, WatchlistView switched from `<img>` to `next/image` (optimizer served via `/_next/image`, automatic `srcset`, lazy-loading). Added `images.remotePatterns` for `assets.coingecko.com` + `coin-images.coingecko.com` in `next.config.ts`.
2. **Tree-shaken d3 imports** — replaced `import * as d3 from 'd3'` with direct imports from the used submodules (`d3-selection`, `d3-scale`, `d3-array`, `d3-axis`, `d3-time-format`, `d3-format`, `d3-shape`). Removed the `d3` meta-package and `@types/d3` barrel from `package.json`; only the 7 used modules are now dependencies. This is the Vercel `bundle-barrel-imports` rule.
3. **Verified code-splitting** — the d3 chunk loads only on `/coin/[id]` (where the chart renders), not on `/` or `/watchlist`. Confirmed via network request inspection: d3 chunk absent from the Markets page request list, present on the coin detail page.
4. **A11y/SEO polish** (Lighthouse failures found during the audit) — bumped low-contrast `text-slate-500` to `text-slate-400` (coin symbols, status rows), fixed heading order (`h3` card titles → `h2` so they follow the page `h1`), added `public/robots.txt` (was missing → SEO −8).
5. **GTM already deferred** — `next/script` `afterInteractive` (pre-existing), no change needed.
6. **React Query devtools** — confirmed Next.js already tree-shakes `ReactQueryDevtools` out of the production bundle (no devtools string present in `.next/static/chunks/*.js`), no change needed.

## After Phase 11 (MUI adoption, T079)

MUI (`@mui/material` + `@mui/icons-material`) was already installed but unused; Phase 11 adopted it for the price-alert `Popover` and all UI icons. The build was re-checked to confirm the existing code-splitting story still holds:

- The `Popover` component + MUI runtime compile into a ~97 KB chunk (`2a4-…`) that is referenced **only by `/coin/[id]`** (client-reference-manifest inspection) — Markets and Watchlist never download it.
- Icons are lightweight individual imports (`@mui/icons-material` per-icon modules): `BookmarkBorder`/`Bookmark`, `NotificationsNone`, `Close`, `ArrowBack`, `ArrowUpward`/`ArrowDownward`/`Remove`. They land in a shared icons chunk loaded on all pages, so the default tab JS cost is a few KB.
- Phase 10's Lighthouse numbers were captured before MUI was wired in; the icon-only cost on `/en` is marginal and the heavy `Popover` payload stays detail-page-only, so the before/after table above remains representative.

## After (Phase 10 complete)

| Route | LCP | INP | CLS | Delta |
|---|---|---|---|---|
| `/en` (Markets) | 195 ms | — | 0.00 | **−73% LCP** |
| `/en/coin/bitcoin` | 193 ms | — | 0.00 | **−73% LCP**, CLS 0.01 → 0.00 |
| `/en/watchlist` | 372 ms | — | 0.00 | **−86% LCP** |

Lighthouse category scores (mobile, `/en`): **Accessibility 96 · Best Practices 100 · SEO 100**.

Bundle: d3 code now lives in a single ~62 KB chunk that is only fetched on the coin detail route; the Markets and Watchlist pages never download it.

## Caveats

- Lab numbers on localhost are flatter than field numbers; expect real-world LCP to be higher. The direction and rough magnitude of the improvements hold regardless.
- No `INP` recording: the trace tool captured LCP/CLS only; INP needs real-user interaction data (field measurement) to be meaningful. There is no blocking JS on any route and no interaction-driven long tasks observed.
- The watchlist "before" LCP (2.59 s) is inflated because that page's LCP element (the empty-state paragraph) only renders after the client-side watchlist query resolves — inherently a client-data-dependent first paint, now mitigated by faster bundle load.

## Tools & commands

```bash
npm run build && npm run start   # production server (localhost:3000)
# Chrome DevTools: performance_start_trace (Fast 3G + 4× CPU) + lighthouse_audit (mobile)
```
