# 🧬 Travel DNA — AI Travel Personality & Planning Engine

> Map your psychological travel archetype. Generate hyper-personalized, constraint-aware itineraries that adapt in real time.

[![CI](https://github.com/Devgr72/Travel-DNA/actions/workflows/ci.yml/badge.svg)](https://github.com/Devgr72/Travel-DNA/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://aistudio.google.com)
[![Tests](https://img.shields.io/badge/tests-81%20passing-brightgreen?logo=vitest&logoColor=white)](./src/lib/__tests__)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?logo=vercel&logoColor=white)](https://travel-dna-delta.vercel.app)

---

## The Problem with Generic AI Trip Planners

Most AI travel tools answer "what should I do in Tokyo?" with the same curated list for everyone. They treat preferences as optional filters, ignore real-world constraints, and produce a static PDF that becomes useless the moment your plans change.

**Travel DNA is different.** Before suggesting a single destination, it maps *how* you travel — scoring six behavioral dimensions from a 10-question assessment. Every itinerary is generated against your archetype, filtered through hard constraints you control, and re-synthesized in a single round-trip whenever reality changes. The DNA model, not a generic prompt, drives every output.

---

## Links

**Live Demo:** https://travel-dna-delta.vercel.app  ·  **Repository:** https://github.com/Devgr72/Travel-DNA

---

## Table of Contents

- [Features](#features)
- [Problem-Statement Alignment](#problem-statement-alignment)
- [Architecture](#architecture)
- [Evaluation Criteria → Implementation Proof](#-evaluation-criteria--implementation-proof)
- [Testing](#testing)
- [Security](#security)
- [Accessibility](#accessibility)
- [AI Tools Used](#ai-tools-used)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Roadmap / Impact](#roadmap--impact)
- [License](#license)

---

## Features

- **Six-dimension behavioral quiz** — 10 questions score `Adventure`, `Food`, `Culture`, `Luxury`, `Social`, and `Exploration` trait vectors; negative scores are valid (Zod-clamped to `[-10, 20]`).
- **AI archetype synthesis** — Gemini 2.5 Flash names your unique traveler archetype and summarizes your behavioral signature, validated against `DnaAnalysisResponseSchema` before any data reaches the UI.
- **Interactive radar chart** — `DNAProfile.tsx` renders a `recharts` radar visualization of your six-trait DNA; chart data is derived from the pure `computeRadarData()` function in `src/lib/dna.ts`.
- **Personality-driven itinerary generation** — destination, duration, and budget tier combine with your trait vector to produce a structured, day-by-day itinerary via Gemini 2.5 Flash.
- **Hard constraints panel** — `ItineraryGenerator.tsx` exposes four constraint fields (daily budget cap, mobility level, dietary restrictions, must-avoid categories) woven deterministically into the Gemini prompt by `buildConstraintsClause()`.
- **`constraintWarning` surface** — when a constraint cannot be fully met, the model is instructed to emit a `constraintWarning` string on the affected activity; fabricated fits are forbidden by the prompt contract.
- **`satisfies` tags and estimated costs** — every activity carries a `satisfies` array (which preference or constraint it meets) and an `estimatedCostUSD` label, always marked as an estimate.
- **One-click weather simulation** — four preset weather events (Sunny & Hot, Heavy Rain, Thunderstorm, Snow) trigger a selective re-plan of affected activities without regenerating the full trip.
- **Free-text real-time adaptation** — any natural-language context ("I feel tired today", "I found a bike rental") can be submitted to `/api/adapt-itinerary` to update only the affected days.
- **Zod validation on all API boundaries** — every request body and every Gemini response is validated server-side; malformed input returns HTTP 400, malformed model output returns HTTP 502.
- **Per-IP rate limiting** — `src/lib/rateLimit.ts` enforces 10 requests per minute per IP with automatic stale-entry purging to bound memory growth.
- **Global security headers** — `next.config.ts` applies `X-Frame-Options`, `X-Content-Type-Options`, HSTS, `Referrer-Policy`, `Permissions-Policy`, and `X-XSS-Protection` to all routes.
- **WCAG-aligned accessibility** — skip-to-content link, `aria-live` re-plan announcements, `role="progressbar"` on the quiz, `fieldset`/`legend` grouping, `useReducedMotion` throughout, and visible focus rings.

---

## Problem-Statement Alignment

The challenge statement calls for a system that plans trips with **preferences**, **constraints**, and **real-time updates**. Here is exactly where each pillar lives in the code.

### 🎯 Preferences

The 10-question `Quiz.tsx` accumulates additive trait scores across six dimensions. The resulting vector is stored in `localStorage` and sent to `/api/analyze-dna`, which returns a Gemini-generated archetype. When a trip is generated, the full trait object is injected into the `/api/generate-trip` prompt so every activity recommendation is grounded in the user's specific behavioral profile — not generic popularity rankings.

**Key files:** `src/components/Quiz.tsx` · `src/components/DNAProfile.tsx` · `src/app/api/analyze-dna/route.ts` · `src/lib/dna.ts`

### 🔒 Constraints

`ItineraryGenerator.tsx` exposes four constraint inputs — `dailyBudgetUSD`, `mobility` (`none | limited | wheelchair`), `dietary` (comma-separated list), and `mustAvoid` (comma-separated list). These are typed against `ConstraintsSchema` (Zod) and forwarded to `/api/generate-trip`, where `buildConstraintsClause()` converts them into natural-language directives injected before the itinerary schema in the Gemini prompt. The model is instructed never to fabricate a fit; it must emit a `constraintWarning` string when a constraint cannot be honoured. `ItineraryTimeline.tsx` renders that warning with `role="alert"` and amber styling.

**Key files:** `src/components/ItineraryGenerator.tsx` · `src/app/api/generate-trip/route.ts` · `src/components/ItineraryTimeline.tsx` · `src/lib/schema.ts`

### ⚡ Real-Time Updates

`AdaptiveItinerary.tsx` presents four preset weather-change buttons and a free-text input. Either path sends the *current* itinerary plus a context string to `/api/adapt-itinerary`, which instructs Gemini to rewrite *only* the affected activities and keep all others unchanged. The `wowFactor` block and personality analysis are never re-sent, keeping the round-trip minimal. An `aria-live="polite"` status region (`<div role="status">`) announces the outcome to screen-reader users without interrupting them.

**Key files:** `src/components/AdaptiveItinerary.tsx` · `src/app/api/adapt-itinerary/route.ts` · `src/lib/weather.ts`

---

## Architecture

```
Travel-DNA/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions: test + lint on every push
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze-dna/
│   │   │   │   └── route.ts          # POST: DNA archetype via Gemini
│   │   │   ├── generate-trip/
│   │   │   │   └── route.ts          # POST: constraint-aware itinerary generation
│   │   │   └── adapt-itinerary/
│   │   │       └── route.ts          # POST: selective real-time re-planning
│   │   ├── dashboard/page.tsx        # Main command center (DNA + generator + timeline)
│   │   ├── quiz/page.tsx             # 10-question personality assessment
│   │   ├── layout.tsx                # Root layout: skip link, lang, Inter font
│   │   └── globals.css               # Design tokens, focus rings, prefers-reduced-motion
│   ├── components/
│   │   ├── Quiz.tsx                  # Behavioral quiz (fieldset/legend, aria-live, progressbar)
│   │   ├── DNAProfile.tsx            # Radar chart + archetype display (aria-live, role="img")
│   │   ├── ItineraryGenerator.tsx    # Trip form + constraints panel (htmlFor/id pairs)
│   │   ├── AdaptiveItinerary.tsx     # Weather buttons + free-text adaptation (aria-live)
│   │   └── ItineraryTimeline.tsx     # Day timeline: satisfies badges, estimatedCostUSD, warnings
│   └── lib/
│       ├── dna.ts                    # Pure: normalizeDnaScores, computeRadarData, getDominantTrait,
│       │                             #        scoreTraitAlignment, getTopTraits
│       ├── itinerary.ts              # Pure: estimateActivityCost, estimateDayCost,
│       │                             #        estimateTotalTripCost, normalizeItinerary,
│       │                             #        filterAffordableActivities, getBusiestDay
│       ├── weather.ts                # Pure: isOutdoorActivity, indoorAlternativeFor,
│       │                             #        swapOutdoorToIndoor, countOutdoorActivities, replanForRain
│       ├── schema.ts                 # Zod schemas for all request bodies + Gemini output
│       ├── rateLimit.ts              # Per-IP in-memory rate limiter (10 req/60 s)
│       ├── securityHeaders.ts        # secureJson() wrapper: JSON response + security headers
│       └── __tests__/
│           ├── dna.test.ts           # 17 tests
│           ├── itinerary.test.ts     # 17 tests
│           ├── schema.test.ts        # 27 tests
│           └── weather.test.ts       # 20 tests — 81 total
├── .env.example                      # Placeholder key; real .env* is gitignored
├── next.config.ts                    # Global security headers (headers() API)
├── vitest.config.ts                  # Node env, @/ alias, V8 coverage
└── package.json                      # "test": "vitest run"
```

**Data flow:**

1. **Input → validation** — the client POSTs a typed request body; the route handler calls `safeParse()` against the relevant Zod schema and returns HTTP 400 with field-level errors on failure.
2. **Validation → Gemini** — `GEMINI_API_KEY` is read inside the handler (never at module level); constraints are rendered into a deterministic prompt clause by `buildConstraintsClause()` before being sent to `gemini-2.5-flash`.
3. **Gemini → output validation** — the raw model JSON is parsed and validated against `TripDataResponseSchema` or `AdaptItineraryResponseSchema`; a schema mismatch returns HTTP 502 before any data reaches the client.
4. **Validated data → UI** — `AdaptiveItinerary.tsx` and `ItineraryTimeline.tsx` render the validated, typed response; `aria-live` regions announce state changes to screen readers.

---

## ★ Evaluation Criteria → Implementation Proof

| Criterion | How it's addressed | Proof — file / test name |
|-----------|-------------------|--------------------------|
| **Code Quality** | All business logic extracted into pure functions with explicit TypeScript types inferred from Zod schemas; zero `any`; ESLint clean; inline criterion tags (`[Security]`, `[Accessibility]`, etc.) mark intent at the point of implementation | `src/lib/dna.ts`, `src/lib/itinerary.ts`, `src/lib/weather.ts`, `src/lib/schema.ts`; `eslint.config.mjs` |
| **Security** | API key read inside each serverless handler (never module-level); all request bodies validated with Zod before use; all Gemini responses validated before rendering; per-IP rate limiter; six security headers on every route and page | `src/lib/schema.ts` · `src/lib/rateLimit.ts` · `src/lib/securityHeaders.ts` · `next.config.ts`; `schema.test.ts` — *"rejects negative dailyBudgetUSD"*, *"rejects context over 1000 characters"*, *"rejects malformed Gemini trip output"* |
| **Efficiency** | `/api/adapt-itinerary` re-plans only the itinerary portion per round-trip — `wowFactor` and personality analysis are never re-sent; `DNAProfile.tsx` wraps `computeRadarData()` in `useMemo` keyed on the DNA object reference; stale-entry purge in `rateLimit.ts` bounds memory growth | `src/app/api/adapt-itinerary/route.ts` (header comment); `src/components/DNAProfile.tsx:47`; `src/lib/rateLimit.ts:13–16` |
| **Testing** | 81 unit tests across 4 files covering pure functions only (no mocked API calls); edge cases include malformed model output, all-zero/negative trait scores, over-budget filtering, and all-outdoor rain days; CI runs the full suite on every push | `src/lib/__tests__/dna.test.ts` (17), `itinerary.test.ts` (17), `schema.test.ts` (27), `weather.test.ts` (20); `.github/workflows/ci.yml` |
| **Accessibility** | Skip-to-content link; `aria-live="polite"` on DNA results and every re-plan; `role="progressbar"` with `aria-valuenow/min/max` on quiz; `fieldset`/`legend` for radio grouping; every form control has `htmlFor`/`id` or `aria-label`; `useReducedMotion()` gates all JS animations; `prefers-reduced-motion` CSS rule strips transitions globally; decorative icons carry `aria-hidden="true"`; radar chart has descriptive `role="img"` label | `src/app/layout.tsx` (skip link); `src/components/Quiz.tsx:193–213, 224–249`; `src/components/AdaptiveItinerary.tsx:103–105`; `src/components/DNAProfile.tsx:109–115`; `src/app/globals.css` |
| **Problem-Statement Alignment** | Preferences: 6-trait DNA vector shapes every itinerary prompt. Constraints: `buildConstraintsClause()` injects budget, mobility, dietary, and must-avoid directives deterministically; `constraintWarning` surfaces unmet constraints honestly. Real-time updates: selective re-plan sends only the itinerary; `aria-live` announces completion | `src/app/api/generate-trip/route.ts:10–31` (`buildConstraintsClause`); `src/components/ItineraryGenerator.tsx` (constraints panel); `src/components/ItineraryTimeline.tsx:89–103` (`constraintWarning`); `src/app/api/adapt-itinerary/route.ts` |

---

## Testing

```bash
npm test
```

Vitest runs all 81 tests in `src/lib/__tests__/` in a Node environment. There are no mocks of the Gemini API or Next.js internals — every test targets pure functions that have no I/O dependencies.

### Test files and what they cover

| File | Tests | Edge cases highlighted |
|------|-------|------------------------|
| `dna.test.ts` | 17 | Trait clamping above max (999→20) and below min (−100→−10); dominant-trait detection with all-equal and all-negative scores; case-insensitive activity alignment |
| `itinerary.test.ts` | 17 | Malformed model output (`null`, missing `days`, invalid `type`, empty `activities`); zero-budget filtering; empty itinerary cost summation |
| `schema.test.ts` | 27 | Gemini response validation (`DnaAnalysisResponseSchema`, `TripDataResponseSchema`); negative `dailyBudgetUSD` rejection; context string length cap (1000 chars); invalid `budget` enum value |
| `weather.test.ts` | 20 | Immutability of `swapOutdoorToIndoor` (original array unchanged); all-outdoor day converted entirely to indoor; `replanForRain` no-op path when no outdoor activities present |

**CI:** `.github/workflows/ci.yml` runs `npm test` and `npm run lint` on every push and pull request to any branch using Node.js 20 and `npm ci` for reproducible installs.

---

## Security

| Practice | Implementation | File |
|----------|---------------|------|
| **API key isolation** | `GEMINI_API_KEY` is read with `process.env` inside each serverless handler — never at module load time, never bundled client-side | All three `route.ts` files |
| **Request body validation** | Zod `safeParse()` on every POST body; invalid input → HTTP 400 with `flatten()`ed field errors | `src/lib/schema.ts`, `src/app/api/*/route.ts` |
| **Model output validation** | Gemini's raw JSON response validated against `TripDataResponseSchema` / `DnaAnalysisResponseSchema` / `AdaptItineraryResponseSchema` before any data is returned to the client; schema mismatch → HTTP 502 | `src/lib/schema.ts` |
| **Rate limiting** | `checkRateLimit(ip)` enforces 10 requests per 60-second window per IP; stale entries purged on each call to bound `Map` size; returns `Retry-After` header on rejection | `src/lib/rateLimit.ts` |
| **Security headers (API)** | `secureJson()` wraps every API response with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` | `src/lib/securityHeaders.ts` |
| **Security headers (pages)** | Same header set applied globally via `next.config.ts` `headers()` — covers all pages and static assets | `next.config.ts` |
| **Secrets hygiene** | `.env`, `.env.local`, `.env.*.local`, `.env.development`, `.env.production` are all gitignored; `.env.example` contains only the literal string `your_gemini_api_key_here` | `.gitignore`, `.env.example` |

---

## Accessibility

Travel DNA is built to WCAG 2.1 AA intent throughout:

- **Skip-to-content link** — visible on focus at the top of every page, linking to `#main-content` (`src/app/layout.tsx:26–31`)
- **`aria-live="polite"` announcements** — DNA analysis results (`DNAProfile.tsx:79–83`) and every adaptive re-plan completion (`AdaptiveItinerary.tsx:103–105`) are announced to screen readers without interrupting them
- **`role="alert"` on active overlays** — the "Recalibrating Timeline…" loading overlay uses `aria-live="assertive"` so urgent state changes are announced immediately (`AdaptiveItinerary.tsx:229`)
- **`role="progressbar"`** — the quiz progress bar carries `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` (`Quiz.tsx:232–239`)
- **`fieldset` / `legend`** — each quiz question groups its radio-style buttons under a `<fieldset>` with the question text as `<legend>` (`Quiz.tsx:263–289`)
- **Label association** — every form control in `ItineraryGenerator.tsx` has a matching `<label htmlFor>` or `aria-label`; the adaptation text input has both (`AdaptiveItinerary.tsx:193–196`)
- **`useReducedMotion()`** — all Framer Motion animations are disabled when `prefers-reduced-motion` is set; CSS also strips `transition` and `animation` globally via `@media (prefers-reduced-motion: reduce)` in `globals.css`
- **Visible focus rings** — `:focus-visible` in `globals.css` applies a 2 px ring to all interactive elements; components use `focus-visible:ring-2 focus-visible:ring-primary` for Tailwind-consistent styling
- **Decorative icons** — every Lucide icon that conveys no information carries `aria-hidden="true"` so it is skipped by screen readers
- **Radar chart description** — the `role="img"` container on `DNAProfile.tsx` carries a dynamically generated `aria-label` listing all six trait scores
- **Semantic structure** — pages use `<main>`, `<section aria-labelledby>`, `<ol>` / `<li>` for the itinerary timeline, `<article>` for each activity card, and `<ul>` for strengths and preference tags

---

## AI Tools Used

| Tool | Role |
|------|------|
| **Google Gemini 2.5 Flash** | Generates DNA archetype titles and summaries (`/api/analyze-dna`), complete personalized itineraries (`/api/generate-trip`), and selective activity re-plans (`/api/adapt-itinerary`) via `@google/generative-ai` |
| **Claude (Anthropic)** | Architected and implemented all source code in this repository using Claude Code |

**Note:** constraint validation (`buildConstraintsClause`, `ConstraintsSchema`, `normalizeItinerary`) and DNA scoring (`normalizeDnaScores`, `scoreTraitAlignment`) are deterministic TypeScript code — not model output.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Setup

```bash
git clone https://github.com/Devgr72/Travel-DNA.git
cd Travel-DNA
npm install
cp .env.example .env.local
# Open .env.local and set: GEMINI_API_KEY=your_key_here
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

The app functions without an API key — all three routes fall back to static mock data so the full UI is explorable immediately.

### Available scripts

```bash
npm test          # Run all 81 Vitest tests
npm run lint      # ESLint (must be clean before merging)
npm run format    # Prettier — write
npm run format:check  # Prettier — check only (non-destructive)
npm run build     # Production Next.js build
```

---

## Deployment

Deploy to Vercel in one step:

```bash
vercel --prod
```

Set `GEMINI_API_KEY` as an environment variable in the Vercel project dashboard. No other configuration is required — `next.config.ts` handles security headers and image domains automatically.

---

## Roadmap / Impact

**Near-term improvements grounded in the current codebase:**

- **Distributed rate limiting** — `src/lib/rateLimit.ts` notes that the in-memory `Map` is per-process; a Redis adapter is the correct next step for multi-instance deployments.
- **Real weather API integration** — the four weather simulations in `AdaptiveItinerary.tsx` currently use static context strings; connecting a live weather feed (e.g. Open-Meteo) would make re-planning genuinely reactive.
- **Persisted itineraries** — trip data is currently held in React state and lost on reload; adding a lightweight persistence layer (database or local storage) would enable trip history and sharing.
- **Expanded quiz dimensions** — the six-trait model could grow to incorporate travel pace, group size preference, and cultural immersion depth without changing the downstream prompt or schema structure.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  <p>Built with intelligence by <strong>Travel DNA</strong></p>
  <p><em>Design philosophy: Make it simple, but significant.</em></p>
</div>
