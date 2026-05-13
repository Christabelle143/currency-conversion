# RemitFlow — Currency Conversion & Remittance Interface

A customer-facing cross-border remittance interface built with Next.js 13 App Router. Features a live exchange rate dashboard with 10-second polling and a 3-step send-money wizard with rate locking and Prometheus metrics.

## Prerequisites

- Node.js 18+
- npm 8+

## Installation

```bash
npm install
```

## Running the application

```bash
# Development (http://localhost:3000)
npm run dev

# Production
npm run build
npm run start
```

The app redirects `/` → `/dashboard`. The remittance wizard is at `/remittance`. Prometheus metrics are scraped at `/api/metrics`.

## Running the tests

```bash
# Run all tests
npm test

# Run a single test file
npm test -- __tests__/formatCurrency.test.ts

# Watch mode
npm run test:watch
```

## Type checking

```bash
npm run type-check
```

## Architecture overview

| Path | Purpose |
|------|---------|
| `app/api/rates` | Mock polling endpoint — returns randomly drifting exchange rates |
| `app/api/quote` | Locks a rate for 5 minutes and returns a quote |
| `app/api/metrics` | Prometheus scrape endpoint (prom-client) |
| `app/api/metrics/increment` | Server action called when Step 2 timer expires |
| `contexts/LiveRatesContext.tsx` | Polls `/api/rates` every 10 s; shared by dashboard and Step 1 |
| `contexts/RemittanceContext.tsx` | Wizard state — locked quote is isolated from polling |
| `lib/i18n.ts` | i18next + ChainedBackend (LocalStorage → HTTP) init |
| `lib/metrics.ts` | prom-client singleton using `global` to survive hot-reload |
| `components/RateDashboard` | Table with green/red flash on rate changes via `onAnimationEnd` |
| `components/Wizard` | Step 1 (live quote), Step 2 (countdown timer), Step 3 (receipt) |

## i18n

Switch languages with the English / Français toggle in the header. Translation files are in `public/locales/{en,fr}/`. All monetary values and dates use `Intl.NumberFormat` / `Intl.DateTimeFormat` driven by the active i18next locale.

## Metrics

```bash
curl http://localhost:3000/api/metrics
```

The counter `remittance_step2_timeout_total{reason="timer_expired"}` increments each time a user's Step 2 countdown expires without confirming.
