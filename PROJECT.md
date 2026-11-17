# Project: Làm Chủ AI Dễ Dàng (AI Literacy Web App)

## Overview
A Vietnamese-language, accessibility-first web application designed to make AI approachable for older adults (*người lớn tuổi*), people with visual impairments (*người có thị giác kém*), and busy beginners with limited tech exposure (*người ít tiếp xúc, ít có thời gian cập nhật công nghệ*).

## Tech Stack & Build/Test Commands
- **Frontend**: Vanilla HTML5 + Vanilla CSS3 (custom properties/design tokens, no TailwindCSS) + Vanilla ES Modules (`src/`).
- **Dev Server & Bundler**: Vite (`vite`) — `npm run dev`, `npm run build`, `npm run preview`.
- **Unit Testing**: Node.js built-in test runner (`node --test tests/unit/*.test.js`).
- **E2E & Accessibility Testing**: Playwright (`@playwright/test` with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and `executablePath: '/usr/bin/chromium'`, `args: ['--no-sandbox']`).

## Code Layout
```text
/home/antigravity/
├── index.html                      # Semantic HTML5 (lang="vi", single h1, ARIA tablist)
├── package.json                    # Scripts: dev, build, preview, test, test:e2e
├── vite.config.js                  # Vite configuration
├── playwright.config.js            # Playwright config pointing to /usr/bin/chromium
├── public/                         # Static assets (favicon, SVG illustrations)
├── src/
│   ├── main.js                     # App entry, state hydration, tab/a11y/search wiring
│   ├── styles/
│   │   ├── tokens.css              # Warm Paper Daylight + High-Contrast + font-size scales
│   │   ├── base.css                # Typography ('Be Vietnam Pro'), focus-visible, reduced-motion
│   │   └── components.css          # Tabs, cards, diagrams, prompt builder, checklist, modals
│   ├── data/
│   │   ├── glossary.js             # SH-06: Plain-Vietnamese jargon dictionary
│   │   ├── basic-guides.js         # CB-01, CB-02, CB-03, CB-06, CB-07 content & templates
│   │   └── advanced-guides.js      # NC-01, NC-02, NC-04, NC-05 content & scenarios
│   ├── utils/
│   │   ├── storage.js              # SH-05: localStorage persistence (prefs, favorites, progress)
│   │   ├── clipboard.js            # SH-04: Copy-to-clipboard + accessible live announcement
│   │   ├── search.js               # SH-03: Diacritic-insensitive Vietnamese search/filter
│   │   └── prompt-helpers.js       # CB-02/CB-04/CB-05/NC-03: Prompt assembly, quality score, Privacy Guard
│   └── components/
│       ├── AccessibilityBar.js     # SH-02: Font size (Vừa 18px / Lớn 21px / Rất lớn 24px) & Contrast toggle
│       ├── TabNav.js               # SH-01: "Cơ bản" <-> "Nâng cao" ARIA tablist + keyboard nav
│       ├── GoalSearch.js           # SH-03: Quick-start goal chips + Vietnamese search
│       ├── GlossaryModal.js        # SH-06: Tappable term explanation popover/modal
│       ├── BasicTab.js             # CB-01..CB-07 orchestration & interactive sections
│       ├── PromptBuilder.js        # CB-04 + CB-05: 5-slot builder, chips, Privacy Guard, Checklist & Score
│       ├── AdvancedTab.js          # NC-01..NC-05 orchestration
│       ├── AgentSimulator.js       # NC-02: Step-by-step Agent + Skills + MCP + Plugin visualizer
│       └── SkillBuilder.js         # NC-03: Dual-mode SKILL.md & Multi-step Workflow Builder
└── tests/
    ├── unit/
    │   ├── prompt-helpers.test.js  # Pure logic tests (assembly, score, privacy guard)
    │   ├── search.test.js          # Diacritic-insensitive Vietnamese search tests
    │   └── storage.test.js         # Persistence & state helper tests
    └── e2e/                        # E2E Testing Track (opaque-box, Tiers 1-4)
```

## Architecture
- **Design System**: Warm Paper Daylight default (`#FAF8F5` bg, `#FFFFFF` card, `#1C1917` text, `#0F5C4D` jade accent; >16:1 contrast) + `Tương phản cao` high-contrast mode (`#FFFFFF` / `#000000` / `#003D82`).
- **Typography**: `'Be Vietnam Pro'` with Vietnamese-safe fallbacks; `18px` default body (`Vừa`), `21px` (`Lớn`), `24px` (`Rất lớn`); `1.7` line-height; `48px+` touch targets; responsive vertical layout across mobile, tablet, and desktop.
- **Standalone Client-Side Flow**: 100% standalone (zero login / zero API key); users compose & check prompts then copy-paste into ChatGPT/Gemini/Claude. No TTS needed.
- **Anti-Cliché Compliance**: Strictly no dashboard overuse, no purple-on-dark, no bento boxes, no over-nested cards (max 1 card level), no headline biscuit pills, no grid backgrounds.
- **Data Flow**: Static ES module data (`src/data/*`) + `localStorage` state (`src/utils/storage.js`) -> pure helpers (`src/utils/*`) -> accessible DOM components (`src/components/*`).

## Feature Inventory
Every Survey feature assigned a milestone (none unassigned).

| # | Feature ID | Feature | Description | Milestone | Source |
|---|------------|---------|-------------|-----------|--------|
| 1 | `SH-01` | Top-Level Tab Switcher | "Cơ bản" <-> "Nâng cao" ARIA tablist + URL hash/storage sync | M1 | Survey 2, 3 |
| 2 | `SH-02` | Vision & Accessibility Bar | Font size (Vừa 18px / Lớn 21px / Rất lớn 24px), Contrast mode (Dịu mắt / Tương phản cao), ≥48px targets | M1 | Survey 2, 3 + User |
| 3 | `SH-04` | One-Click Copy & Paste Guide | Copy button with confirmation + 3-step "Cách dán vào AI" mini-guide | M1 | Survey 3 |
| 4 | `SH-05` | Local Persistence | Save prefs, favorites, lesson progress in `localStorage` | M1 | Survey 3 |
| 5 | `SH-06` | Plain-Vietnamese Glossary | Tappable jargon terms (*Prompt, Agent, Skill, MCP, Plugin*) | M1 | Survey 2, 3 |
| 6 | `CB-01` | Gentle Intro to AI | Jargon-free AI intro + "AI làm được không?" 4-card mini-quiz | M2 | Survey 3 |
| 7 | `CB-02` | Safety & Privacy Shield | "KHÔNG chia sẻ với AI" guide + client-side Privacy Guard regex | M2 | Survey 3 |
| 8 | `CB-03` | 4 Core Effective AI Principles | Step-by-step visual cards + 4-part Prompt Anatomy diagram | M2 | Survey 2, 3 |
| 9 | `CB-04` | Interactive Pre-Send Prompt Builder | 5-slot guided builder + quick-pick chips + live preview + Privacy Guard | M3 | Survey 2, 3 |
| 10 | `CB-05` | Pre-Send Checklist & Quality Score | Live 0–100% readiness meter & 5-item checklist tied to `CB-04` | M3 | Survey 3 |
| 11 | `CB-06` | Before-vs-After Comparison | Interactive toggle contrasting vague vs complete first-try prompts | M3 | Survey 2, 3 |
| 12 | `CB-07` | Everyday Vietnamese Templates | Copy-ready & "Load into Builder" templates across 4 life domains | M3 | Survey 3 |
| 13 | `NC-01` | Demystifying Advanced Concepts | Everyday Analogy Diagram (AI, Agent Skills, MCP, Plugins) + decision table + collapsible technical config (JSON/CLI) | M4 | Survey 2, 3 + User |
| 14 | `NC-02` | Interactive Agent/Skill/MCP Simulator | Step-by-step flow visualizer with Permission Gate | M4 | Survey 2, 3 |
| 15 | `NC-03` | Advanced Skill & Workflow Builder | Dual-mode `SKILL.md` & Multi-step Agent Prompt builder + preview | M4 | Survey 3 |
| 16 | `NC-04` | Real-World Advanced Templates | Copy-ready Skill/MCP/Plugin templates + "Load into Builder" + collapsible JSON/CLI config | M4 | Survey 3 + User |
| 17 | `NC-05` | Agent Safety & Permissions | Read vs Write/Delete, Human-in-the-Loop, Prompt Injection guide | M4 | Survey 3 |
| 18 | `SH-03` | Quick-Start Goal Picker & Search | Diacritic-insensitive Vietnamese search + goal chips jumping to sections/builders | M5 | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| M1 | Foundation, Design System & Shared Shell | Project setup (`package.json`, `vite.config.js`, `index.html`), `tokens.css`/`base.css`/`components.css`, `SH-01`, `SH-02`, `SH-04`, `SH-05`, `SH-06`, unit tests | none | DONE |
| M2 | Tab "Cơ bản" — Literacy, Safety & Principles | `basic-guides.js` (intro, safety, principles), `CB-01` mini-quiz, `CB-02` Privacy Shield + regex helper, `CB-03` 4 Principles & Anatomy diagram, unit tests | M1 | DONE |
| M3 | Tab "Cơ bản" — Interactive Prompt Builder & Templates | `CB-04` 5-slot Prompt Builder, `CB-05` Pre-Send Checklist & Quality Score, `CB-06` Before/After Gallery, `CB-07` Everyday Templates, unit tests | M2 | DONE |
| M4 | Tab "Nâng cao" — Skills, MCP, Plugins & Simulator | `advanced-guides.js`, `NC-01` Analogy Diagram, `NC-02` Interactive Simulator, `NC-03` Skill/Workflow Builder, `NC-04` Templates + collapsible JSON/CLI technical config, `NC-05` Safety/Permissions, unit tests | M1 | DONE |
| M5 | Cross-Cutting Search, Polish & Integration | `SH-03` Diacritic-insensitive Vietnamese Goal Picker & Search across both tabs, gentle onboarding strip, full integration & unit tests | M3, M4 | DONE |
| M6 | Final Milestone — E2E Pass (Tiers 1–4) & Adversarial Hardening (Tier 5) | Pass 100% of E2E suite from `TEST_READY.md` (Tiers 1–4) + Tier 5 adversarial coverage hardening | M5, E2E Track (`TEST_READY.md`) | DONE |

## Interface Contracts

### `src/utils/storage.js` ↔ Components
- `loadState()`: returns `{ activeTab: 'basic'|'advanced', fontSize: 'medium'|'large'|'xlarge', contrast: 'warm'|'high', favorites: Array, completedIds: Array<string> }`
- `saveState(partialState)`: merges and persists to `localStorage` under key `'lam_chu_ai_v1'`
- `resetState()`: clears `'lam_chu_ai_v1'` and returns defaults

### `src/utils/prompt-helpers.js` ↔ `PromptBuilder.js` / `SkillBuilder.js`
- `assembleBasicPrompt({ role, context, task, format, constraints })`: returns formatted Vietnamese prompt string
- `evaluatePromptQuality(fields)`: returns `{ score: number (0..100), checks: Array<{ id, label, passed, tip }>, privacyWarnings: Array<string> }`
- `detectSensitiveInfo(text)`: returns array of Vietnamese warning strings (CCCD/12-digit ID, OTP/password/bank keywords)
- `assembleSkillMarkdown({ name, trigger, steps, tools, safety })`: returns formatted `SKILL.md` / Agent workflow string

### `src/utils/search.js` ↔ `GoalSearch.js`
- `normalizeVietnamese(str)`: strips diacritics and lowercases (`đ` -> `d`)
- `searchItems(query, items)`: returns matching items across Basic & Advanced guides/templates
