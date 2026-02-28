# Load testing

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed (e.g. `brew install k6` or download from k6.io).

## Smoke test (light load)

From the project root:

```bash
# Against local dev server (start with npm run dev first)
k6 run scripts/load/k6-smoke.js

# Against staging/production (use with care)
BASE_URL=https://your-staging-url.vercel.app k6 run scripts/load/k6-smoke.js
```

**Pass criteria:** 95% of requests < 3s, error rate < 1%. Adjust thresholds in `k6-smoke.js` if needed.

## What is exercised

- GET `/` (home)
- GET `/designers` (browse)
- GET `/login`
- GET `/register`

Authenticated flows (customer/designer/admin dashboards) require cookies; add a second script that logs in once and reuses the session if you need to test those.

## Heavier load

Increase `vus` and `duration` in `options`, or add more URLs. Run against staging, not production, to avoid impacting users.
