# TEST_READY — E2E Test Suite Ready for Milestone 6

The opaque-box Playwright E2E test suite and test infrastructure for **Làm Chủ AI Dễ Dàng** are complete, syntax-verified, and discoverable.

## File Inventory
- [`playwright.config.js`](./playwright.config.js) — ESM Playwright config using system Chromium (`/usr/bin/chromium`, `--no-sandbox`), `chromium-desktop` (`1280x800`) and `chromium-mobile` (`390x844`), and Vite preview/dev `webServer`.
- [`TEST_INFRA.md`](./TEST_INFRA.md) — Runtime environment, browser binary, project matrix, tier architecture, and verification commands.
- [`tests/e2e/helpers.js`](./tests/e2e/helpers.js) — Shared opaque-box helpers (error listeners, clipboard permissions, `lam_chu_ai_v1` `localStorage` helpers, resilient ARIA/Vietnamese locators).
- [`tests/e2e/tier1-shared.spec.js`](./tests/e2e/tier1-shared.spec.js) — Tier 1 Shared Shell & Cross-Cutting (`SH-01`..`SH-06`, standalone zero-auth flow).
- [`tests/e2e/tier1-basic.spec.js`](./tests/e2e/tier1-basic.spec.js) — Tier 1 Basic Tab (`CB-01`..`CB-07`).
- [`tests/e2e/tier1-advanced.spec.js`](./tests/e2e/tier1-advanced.spec.js) — Tier 1 Advanced Tab (`NC-01`..`NC-05` + accessibility check).
- [`tests/e2e/tier2-boundaries.spec.js`](./tests/e2e/tier2-boundaries.spec.js) — Tier 2 Boundaries, Negatives & Edge Cases (Shared, Basic, Advanced).
- [`tests/e2e/tier3-combinations.spec.js`](./tests/e2e/tier3-combinations.spec.js) — Tier 3 Pairwise Feature Combinations.
- [`tests/e2e/tier4-scenarios.spec.js`](./tests/e2e/tier4-scenarios.spec.js) — Tier 4 Realistic End-User Scenarios.
- [`tests/e2e/accessibility.spec.js`](./tests/e2e/accessibility.spec.js) — Accessibility & Responsive Layout (`font-size`, `line-height`, `>= 48px` touch targets, keyboard nav, `lang="vi"`, single `<h1>`, zero horizontal overflow on `375x812` & `1280x800`).

## Test Counts per Tier
| Spec File | Unique Tests | Projects (`desktop` + `mobile`) | Total Discovered |
|---|---|---|---|
| `tier1-shared.spec.js` | 7 | 2 | 14 |
| `tier1-basic.spec.js` | 7 | 2 | 14 |
| `tier1-advanced.spec.js` | 6 | 2 | 12 |
| `tier2-boundaries.spec.js` | 17 | 2 | 34 |
| `tier3-combinations.spec.js` | 5 | 2 | 10 |
| `tier4-scenarios.spec.js` | 5 | 2 | 10 |
| `accessibility.spec.js` | 4 | 2 | 8 |
| **Total** | **51** | **2** | **102** |

## Verification Results
- `node --check playwright.config.js && node --check tests/e2e/*.js` — **PASSED** (exit code 0, Node `v24.22.2`).
- `npx playwright test --list` — **PASSED** (`Total: 102 tests in 7 files`).

## Milestone 6 Run Command
Once M1–M5 application milestones are complete, execute the full E2E suite via:
```bash
npm run test:e2e
```
Or directly with Playwright:
```bash
npx playwright test
```
