# Test Infrastructure — Làm Chủ AI Dễ Dàng

## 1. Runtime & Environment
- **Module Format**: Node.js ES Modules (`"type": "module"` in `package.json`).
- **Frontend Server**:
  - **Default (Production Preview)**: `npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` -> `http://127.0.0.1:4173`
  - **Development Mode (`PW_USE_DEV=1`)**: `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` -> `http://127.0.0.1:5173`
  - **Override**: `BASE_URL` environment variable overrides the default `baseURL`.
- **Test Runner**: `@playwright/test` installed with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` (uses the system Chromium binary rather than downloading a bundled browser).
- **Browser Binary**: `/usr/bin/chromium` (overridable via `CHROMIUM_PATH`), launched headless with:
  - `--no-sandbox`
  - `--disable-setuid-sandbox`
  - `--disable-dev-shm-usage`

## 2. Playwright Projects
Defined in [`playwright.config.js`](./playwright.config.js):
- `chromium-desktop`: `1280x800` desktop viewport.
- `chromium-mobile`: `390x844` mobile viewport (plus explicit `375x812` overflow checks in accessibility tests).

## 3. E2E Test Suite Architecture (Opaque-Box)
All specs live under `tests/e2e/` and interact strictly through user-visible semantics (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByText` with Vietnamese regexes) and browser APIs (`localStorage`, clipboard, URL hash, computed styles). No internal CSS class names or DOM IDs are coupled.

### Test Files & Tiers
| File | Tier | Coverage |
|---|---|---|
| `tests/e2e/helpers.js` | Shared | Error/pageerror collector, clipboard permission grant, `localStorage` (`lam_chu_ai_v1`) reader/seeder, resilient ARIA/Vietnamese locators |
| `tests/e2e/tier1-shared.spec.js` | Tier 1 (Happy Path) | `SH-01`..`SH-06`: Tab switcher + hash/storage sync, font size (`Vừa`/`Lớn`/`Rất lớn`) + contrast (`Dịu mắt`/`Tương phản cao`), Goal Picker & Search, One-click Copy + 3-step paste guide, `localStorage` persistence, Glossary modal (*Prompt, Agent, Skill, MCP, Plugin*), zero-auth standalone flow |
| `tests/e2e/tier1-basic.spec.js` | Tier 1 (Happy Path) | `CB-01`..`CB-07`: Gentle intro + 4-card mini-quiz, Safety & Privacy Shield, 4 Core Principles + Prompt Anatomy, 5-slot Prompt Builder + chips + live preview, Pre-Send Checklist & 0–100% Quality Score, Before-vs-After toggle, Everyday Templates across 4 domains + Load into Builder |
| `tests/e2e/tier1-advanced.spec.js` | Tier 1 (Happy Path) | `NC-01`..`NC-05`: Analogy Diagram + decision table + collapsible JSON/CLI, Interactive Agent/Skill/MCP Simulator with Permission Gate, Dual-mode `SKILL.md` & Multi-step Workflow Builder, Advanced Templates + Load into Builder + collapsible JSON/CLI, Agent Safety & Permissions, Advanced tab accessibility |
| `tests/e2e/tier2-boundaries.spec.js` | Tier 2 (Boundaries & Negatives) | Min/max font sizes, diacritic-insensitive search (`co ban`, `chao hoi`, `d` vs `đ`), empty/whitespace/no-match search, invalid URL hashes (`#nonexistent`, `#invalid`, `#%ZZ`), corrupted `localStorage` fallback, empty Prompt Builder, Privacy Guard triggers (12-digit CCCD, OTP, `mật khẩu`, `tài khoản ngân hàng`) & recovery, extreme long input, empty Skill Builder, Simulator Permission Gate Deny/Cancel vs Approve, rapid toggles, Simulator mid-flow reset |
| `tests/e2e/tier3-combinations.spec.js` | Tier 3 (Pairwise Combinations) | Font size + contrast + tab switch + reload; Template -> Load into Builder -> Checklist/Score -> Copy; diacritic-free Search -> jump to section -> interact; Advanced Template -> Load into Builder -> JSON/CLI toggle -> Copy `SKILL.md`; Glossary term tap -> close -> context/focus preserved |
| `tests/e2e/tier4-scenarios.spec.js` | Tier 4 (User Scenarios) | Realistic end-to-end journeys for older adults, low-vision users, busy beginners, and curious learners |
| `tests/e2e/accessibility.spec.js` | Accessibility | Computed body `font-size` (`>= 18px`, `>= 21px`, `>= 24px`), `line-height >= 1.5`, touch targets `>= 48px` across tabs/viewports, keyboard navigation (`Tab`, `ArrowLeft`/`ArrowRight`, `Escape`), single `<h1>` + `lang="vi"`, zero horizontal overflow (`scrollWidth <= innerWidth`) on `375x812` and `1280x800` |
| *Tier 5 (M6 Hardening)* | Tier 5 (Adversarial) | Added during Milestone 6 after Tiers 1–4 pass 100% |

## 4. Verification Commands
- **Syntax check**:
  ```bash
  node --check playwright.config.js && node --check tests/e2e/*.js
  ```
- **Test discovery**:
  ```bash
  npx playwright test --list
  ```
- **Run full E2E suite**:
  ```bash
  npm run test:e2e
  ```
- **Run against dev server**:
  ```bash
  PW_USE_DEV=1 npx playwright test
  ```
