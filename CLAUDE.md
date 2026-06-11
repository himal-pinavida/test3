# CLAUDE.md

Guidance for working in this repository. Keep this file lean (< 30KB).

## What this is

**AI Resume Roast Generator** — a browser app that turns a résumé into funny-but-constructive
feedback (a comedic "roast" plus actionable improvement tips). Greenfield build.

This repo is currently being bootstrapped via **Story 1**: a shippable, Linux-deployable
monorepo baseline. Résumé parsing, LLM integration, persistence, admin UI, and share links are
**out of scope** for Story 1 (future stories).

## Stack & key decisions (locked)

- **Monorepo:** pnpm workspaces (Node 20 LTS in CI; local dev on 18.18+/20/22; pnpm 9.x via Corepack)
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
2. Bootstrap pnpm workspace + shared tooling (manifests, strict tsconfigs, shared ESLint/Prettier,
   root cross-workspace scripts).
3. Minimal runnable web + api; wire both to `packages/shared`; `.env.example` for both;
   fail-fast env validation.
4. API `/healthz` + `/readyz` (200, JSON, no DB dep); request logging with correlation id and
   no body/PII logging; redaction helper.
5. Vitest + ≥1 passing test per workspace with coverage (synthetic fixtures only);
   `.gitlab-ci.yml` Node 20, `lint → test → build`.

## Workflow notes

- Branch: `feature/1-bootstrap-monorepo-project-structure-nextjs`.
- Before opening an MR, run: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`.
- pnpm is provisioned via Corepack (`corepack enable`); it is not pre-installed in the container.
