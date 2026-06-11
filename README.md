# AI Resume Roast Generator

Turn a résumé into funny-but-constructive feedback: a comedic "roast" that highlights clichés,
weak phrasing, and unclear impact, followed by practical improvement tips.

> **Status:** Baseline monorepo scaffolding (Story 1). Résumé parsing, LLM integration, persistence,
> admin UI, and share links are intentionally **out of scope** for this story and arrive in later work.

---

## Tech stack

| Area            | Choice                                          |
| --------------- | ----------------------------------------------- |
| Web app         | Next.js (App Router) + React, TypeScript strict |
| API             | Node.js + Express, TypeScript strict            |
| Shared code     | TypeScript package (`packages/shared`)          |
| Package manager | **pnpm** workspaces                             |
| Testing         | Vitest (+ React Testing Library, Supertest)     |
| Lint / format   | ESLint + Prettier                               |
| CI/CD           | GitLab CI (Node 20 LTS) → lint → test → build   |
| Hosting (later) | Render (Linux), managed PostgreSQL + Redis      |

---

## Repository layout

```
.
├── apps/
│   ├── web/            # Next.js (App Router) web app  → http://localhost:3000
│   └── api/            # Express + TypeScript API      → http://localhost:4000
├── packages/
│   └── shared/         # Shared TypeScript types & utilities (e.g. redaction helpers)
├── tooling/
│   └── config/         # Shared ESLint, Prettier, and base tsconfig
├── .gitlab-ci.yml      # CI pipeline skeleton (lint → test → build)
├── pnpm-workspace.yaml # pnpm workspace definition
├── package.json        # Root scripts that run across all workspaces
└── README.md
```

---

## Prerequisites

| Tool    | Version                                                                        |
| ------- | ------------------------------------------------------------------------------ |
| Node.js | **20 LTS** (enforced in CI). Local development works on Node 18.18+, 20, or 22 |
| pnpm    | **9.x** — easiest via Corepack (bundled with Node 16.13+)                      |

Enable pnpm through Corepack (no separate global install required):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Verify:

```bash
node --version   # v20.x (or 18.18+/22.x locally)
pnpm --version   # 9.x
```

---

## Quickstart

```bash
# 1. Install all workspace dependencies (from the repo root)
pnpm install

# 2. Create local env files from the templates (see "Environment variables" below)
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# 3. Start the web app and the API together
pnpm dev
```

Once running:

- **Web:** http://localhost:3000
- **API:** http://localhost:4000 (health check: http://localhost:4000/healthz)

---

## Commands

Run all of these from the **repository root**. Each one fans out across every workspace
(`apps/web`, `apps/api`, `packages/shared`) unless noted.

| Command             | What it does                                                          |
| ------------------- | --------------------------------------------------------------------- |
| `pnpm install`      | Install dependencies for all workspaces                               |
| `pnpm dev`          | Start the web app (port 3000) and the API (port 4000) for development |
| `pnpm lint`         | Run ESLint across all workspaces                                      |
| `pnpm format`       | Format the codebase with Prettier (writes changes)                    |
| `pnpm format:check` | Check formatting without writing changes (used in CI)                 |
| `pnpm typecheck`    | Run TypeScript strict type-checking across all workspaces             |
| `pnpm test`         | Run unit tests (Vitest) with coverage across all workspaces           |
| `pnpm build`        | Production build of all workspaces                                    |

You can target a single workspace with pnpm's `--filter` flag, e.g.:

```bash
pnpm --filter @resume-roast/web dev
pnpm --filter @resume-roast/api test
```

---

## Environment variables

Secrets and configuration are provided through environment variables — **never** hard-coded
or committed.

- Each app ships an `.env.example` template listing every variable it reads, with safe
  placeholder values:
  - `apps/web/.env.example`
  - `apps/api/.env.example`
- Copy each template to a local `.env` (`cp apps/api/.env.example apps/api/.env`) and fill in
  real values locally.
- `.env` files are git-ignored and must never be committed.
- Apps **fail fast** on startup with a clear error message if a required variable is missing.

For this bootstrap story the required variables are intentionally minimal (e.g. `PORT`,
`NODE_ENV`); later stories add provider keys and datastore URLs.

---

## Security & privacy guardrails

This product treats résumé content as sensitive PII. Even at the scaffolding stage we follow
a safe-default posture:

- **Never commit secrets** (API keys, tokens, credentials). Use `.env` files locally and the
  hosting platform's secret manager in deployed environments.
- **Never commit real résumés or any PII** — sample data and test fixtures must be synthetic.
- **Do not log résumé content or request bodies.** Logging is structured and carries a
  correlation/request id; a redaction/scrubbing helper enforces this guardrail.
- Raw résumé text is **not persisted by default**.

---

## Continuous integration

GitLab CI runs on **Node 20 LTS** with three stages that mirror the local scripts:

```
lint  →  test  →  build
```

A non-zero exit from lint, type-check, test, or build **fails the pipeline and blocks the
merge request**. Coverage is produced as a CI artifact, even if minimal.

---

## Contributing workflow

1. Create a feature branch.
2. Make your changes; keep TypeScript strict (no implicit `any`).
3. Before opening a merge request, run locally:
   ```bash
   pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
   ```
4. Open a merge request; CI must be green to merge.
