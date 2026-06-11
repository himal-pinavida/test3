# CLAUDE.md

Guidance for working in this repository. Keep this file lean (< 30KB).

## What this is

**AI Resume Roast Generator** — a browser app that turns a résumé into funny-but-constructive
feedback (a comedic "roast" plus actionable improvement tips). Greenfield build.

This repo is currently being bootstrapped via **Story 1**: a shippable, Linux-deployable
monorepo baseline. Résumé parsing, LLM integration, persistence, admin UI, and share links are
**out of scope** for Story 1 (future stories).

## Stack & key decisions (locked)

- **Monorepo:** pnpm workspaces (Node 20 LTS in CI; local dev needs Node **≥20.9** — Next 16; pnpm `11.5.3` via Corepack)
- **Web:** Next.js (App Router) + React, TypeScript strict — port **3000**
- **API:** Node.js + Express, TypeScript strict — port **4000**
- **Shared:** `packages/shared` TypeScript package
- **Testing:** Vitest (+ React Testing Library for web, Supertest for api), with coverage
- **Lint/format:** ESLint + Prettier (CI fails on violations)
- **CI:** GitLab CI, stages `lint → test → build`, blocks MR on failure
- **Hosting (later):** Render (Linux), managed PostgreSQL + Redis
- **Workspace package names:** `@resume-roast/web`, `@resume-roast/api`, `@resume-roast/shared`

## Target layout

```
apps/web         Next.js App Router web app  (:3000)
apps/api         Express + TS API            (:4000)  /healthz, /readyz
packages/shared  shared types/utils (e.g. redaction helper)
tooling/config   shared eslint/prettier/base tsconfig
pnpm-workspace.yaml, package.json (root scripts), .gitlab-ci.yml, README.md
```

## Root commands (run from repo root)

`pnpm install` · `pnpm dev` · `pnpm lint` · `pnpm format` · `pnpm format:check` ·
`pnpm typecheck` · `pnpm test` · `pnpm build`

Target one workspace with `pnpm --filter <name> <script>`.

## Non-negotiable guardrails

- **TypeScript strict everywhere**; no implicit `any`.
- **Privacy:** treat résumé content as sensitive PII. Never log request bodies or user content;
  never persist raw résumé text by default. Use the redaction/scrubbing helper. Structured logs
  carry a correlation/request id.
- **Secrets:** never commit secrets or real résumés/PII. Config via `.env` (git-ignored), created
  from `.env.example`. Apps fail fast with a clear message on missing required env vars.
- **Reliability:** bounded retries, timeouts, graceful error handling for provider failures (later).
- **Prompts:** versioned templates, not inline strings (later stories).
- Prefer a modular monolith; avoid premature microservices.

## Story 1 implementation steps

1. README quickstart — **done**.
2. Bootstrap pnpm workspace + shared tooling — **done**.
3. Minimal runnable web + api; wire both to `packages/shared`; `.env.example` for both;
   fail-fast env validation — **done**.
4. API `/healthz` + `/readyz` (200, JSON, no DB dep); request logging with correlation id and
   no body/PII logging; redaction helper — **done**.
5. Vitest + ≥1 passing test per workspace with coverage (synthetic fixtures only);
   `.gitlab-ci.yml` Node 20, `lint → test → build` — **done**.

## Build & tooling notes (as built)

- **Pinned versions:** TypeScript `6.0.3`, ESLint `10.4.1` (flat config only — no `.eslintrc`),
  typescript-eslint `8.61.0`, Prettier `3.8.4`, pnpm `11.5.3` (`packageManager` field).
- **Script orchestration:** `lint`/`format` are **root-centric** (root `eslint .` + `prettier`,
  built on `@resume-roast/config`); `typecheck`/`build`/`test`/`dev` **fan out** via
  `pnpm -r run` (each package owns its own tooling). `pnpm -r run` skips packages missing a
  script, so partially-scaffolded steps don't break root commands.
- **Shared package is consumed as TypeScript source** (`exports` → `./src/index.ts`,
  Turborepo "just-in-time" pattern): no build-ordering friction. Web uses Next
  `transpilePackages: ['@resume-roast/shared']`; api dev uses `tsx`.
- Per-package `tsconfig.json` all `extends @resume-roast/config/tsconfig.base.json`.
- **API build = `tsup` (esbuild)**, not `tsc`: bundles the shared source so `dist/index.js`
  is runnable. Strict typecheck stays with `tsc --noEmit` (esbuild strips types). API is split
  `env.ts` / `app.ts` (createApp, no listen — Supertest-ready) / `index.ts` (listen + shutdown).
- **Env validation (fail-fast, zod):** api `src/env.ts` (`loadEnv` → exit 1 on bad config);
  web `src/env.mjs` imported by `next.config.mjs` (throws on bad config). Both have safe defaults.
- **ESLint:** `no-console: warn` in the shared base (privacy guardrail; opt out locally for
  sanctioned startup logs); root config adds Node/browser globals via `globals`.
- **pnpm build approvals:** `esbuild` + `sharp` are allow-listed in `pnpm-workspace.yaml`
  (`allowBuilds`); `@types/node` is in `minimumReleaseAgeExclude`.
- **API logging = `pino` + `pino-http`:** correlation id from inbound `x-request-id` or a
  generated UUID (echoed on the response, attached as `req.id`); allow-list serializers log
  only `{id, method, url}` / `{statusCode}` — never bodies/headers/user content. Health probes
  excluded; logger silent under `NODE_ENV=test`. Health logic is pure fns in `src/health.ts`.
- **Shared is a single-file entry (`src/index.ts`) on purpose:** it is consumed as TS source,
  and **Turbopack does not rewrite a `.js` import specifier to a `.ts` file** (tsc, tsx, esbuild
  do). Avoid intra-package relative imports in `shared` until a compiled build exists. Privacy
  helpers `redactPII` / `scrubObject` / `REDACTED` live there.
- **Testing = Vitest 4 + `@vitest/coverage-v8`** per workspace (`test` = `vitest run --coverage`):
  shared (node) redaction units, api (node) Supertest health/correlation-id, web (jsdom + RTL)
  home page. Coverage reporters `text`/`lcov`/`cobertura`. Test files are **excluded from each
  `tsconfig.json`** so `tsc`/`tsup`/`next build` never compile them (still ESLint-linted). All
  fixtures are synthetic — never real résumé/PII.
- **CI = `.gitlab-ci.yml`** (Node 20, pnpm via Corepack, store cached on `pnpm-lock.yaml`):
  `lint` (eslint + prettier check + tsc) → `test` (vitest + cobertura/lcov artifacts) →
  `build`. Non-zero exit blocks the MR.

## Workflow notes

- Branch: `feature/1-bootstrap-monorepo-project-structure-nextjs`.
- Before opening an MR, run: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`.
- **pnpm location:** Corepack cannot symlink into `/usr/bin` in this container (EACCES). pnpm was
  installed to `~/.local/bin` via `corepack enable --install-directory ~/.local/bin`. Prefix shell
  commands with `export PATH="$HOME/.local/bin:$PATH"` (shell state does not persist between calls).
