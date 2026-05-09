# Gifted — Phase 1 Swarm Tasks

Three sequential tasks for the swarm orchestrator, derived from the Phase 1 plan in
`research/report/Gifted-SEM-niche-heatmap-2026-05-09.pdf` (PR #3 on `svantepagels/gifted`).

## ⚠️ Sequencing matters

These tasks are **strictly sequential** — each builds on the previous one's branch.

| # | Task | File | Branch | Depends on |
|---|------|------|--------|------------|
| 1 | i18n routing for 9 locales | [`01-i18n-routing.md`](./01-i18n-routing.md) | `feat/i18n-routing` ← `main` | — |
| 2 | Per-locale × per-brand landing-page generator | [`02-landing-page-generator.md`](./02-landing-page-generator.md) | `feat/landing-page-generator` ← Task 1 merged | Task 1 in `main` |
| 3 | SEO scaffolding (schema, sitemap, robots, hreflang) | [`03-seo-scaffolding.md`](./03-seo-scaffolding.md) | `feat/seo-scaffolding` ← Task 2 merged | Tasks 1 + 2 in `main` |

**Do not run them in parallel.** Task 2 references the `app/[locale]/...` tree from Task 1; Task 3 references the `[brand]` page from Task 2.

## Running them

Each task brief is a standalone markdown spec the swarm can read. Use the swarm executor:

```bash
cd /Users/administrator/.openclaw/workspace/swarm

# Task 1 — start now
npx tsx execute-task.ts "Implement Gifted Phase 1 Task 1 — i18n routing. Read the full brief at /Users/administrator/.openclaw/workspace/gifted-research/swarm-tasks/01-i18n-routing.md and execute it end-to-end. Repo: svantepagels/gifted, branch: feat/i18n-routing cut from main, target PR into main. GitHub token and Vercel token are pre-loaded in your environment."

# Task 2 — start ONLY after Task 1's PR is merged
npx tsx execute-task.ts "Implement Gifted Phase 1 Task 2 — per-locale × per-brand landing-page generator. Read the full brief at /Users/administrator/.openclaw/workspace/gifted-research/swarm-tasks/02-landing-page-generator.md and execute it end-to-end. Repo: svantepagels/gifted, branch: feat/landing-page-generator cut from main (after Task 1 is merged), target PR into main."

# Task 3 — start ONLY after Task 2's PR is merged
npx tsx execute-task.ts "Implement Gifted Phase 1 Task 3 — SEO scaffolding (JSON-LD, sitemap, robots, hreflang). Read the full brief at /Users/administrator/.openclaw/workspace/gifted-research/swarm-tasks/03-seo-scaffolding.md and execute it end-to-end. Repo: svantepagels/gifted, branch: feat/seo-scaffolding cut from main (after Task 2 is merged), target PR into main."
```

## Pipeline shape per task

Each task should run the full hierarchical swarm:
**architect → coder → tester → reviewer → integrator** (5-stage default).

The briefs are detailed enough that the architect should produce a tight design doc rather than a re-research effort.

## What "done" looks like (per task)

- [ ] Branch pushed to GitHub
- [ ] PR opened against `main` with the brief's PR description template filled in
- [ ] All acceptance criteria from the brief verified
- [ ] Swarm sub-agents have validated against tests + Lighthouse where applicable
- [ ] Vercel preview deployment succeeds
- [ ] Svante reviews and merges manually (don't auto-merge — this is product-critical work)

## Estimated total swarm wall time

- Task 1: ~30–60 min
- Task 2: ~60–120 min (largest — most files, most copy)
- Task 3: ~30–45 min

Total ~2–3.5 hours of autonomous swarm work, gated by Svante's review between tasks.
