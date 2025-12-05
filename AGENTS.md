# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js + TypeScript app. Keep feature changes close to existing folders:

- `pages/`: route entry points (`pages/api/` for server endpoints).
- `components/`: UI and reusable view logic (`components/ui/` for primitive controls).
- `hooks/`: custom React hooks.
- `lib/`: integration logic (OpenAI, Supabase, Upstash, LemonSqueezy).
- `utils/`: pure helpers and schema utilities (`utils/schemas/`).
- `styles/`: global and markdown styles.
- `public/`: static assets and images.

## Build, Test, and Development Commands

Use `npm` with the committed lockfile:

- `npm ci`: install exact dependencies.
- `npm run dev`: start local dev server at `http://localhost:3000`.
- `npm run build`: production build (also catches type/build issues).
- `npm run start`: run the built app.
- `docker compose up -d`: run containerized service after creating `.env`.

There is no dedicated lint/test script. Use:

- `npx prettier --check .`: formatting check.
- `npx tsc --noEmit`: explicit TypeScript check.

## Coding Style & Naming Conventions

- TypeScript strict mode is enabled; prefer explicit, narrow types.
- Formatting is enforced by Prettier (`singleQuote: true`, `semi: false`, `trailingComma: all`, `printWidth: 120`).
- Pre-commit hook runs `lint-staged` with `prettier --write --ignore-unknown`.
- Use naming patterns already present:
  - Components: `PascalCase.tsx` (example: `SummaryResult.tsx`)
  - Hooks: `useSomething.ts` (example: `useSummarize.ts`)
  - Helpers: `camelCase.ts` (example: `extractUrl.ts`)
- Prefer path aliases `@/` or `~/` for root imports.

## Testing Guidelines

No automated test framework is configured yet. For every behavioral change, include manual verification notes in your PR:

- Main summary flow from `pages/index.tsx`
- Any affected API endpoint in `pages/api/`
- At least one source parsing case (YouTube or Bilibili)

If adding tests, colocate them as `*.test.ts` or `*.test.tsx` near changed modules.

## Commit & Pull Request Guidelines

- Follow Conventional Commits used by release tooling: `feat:`, `fix:`, `docs:`, `chore:` (optional scope, e.g. `chore(main):`).
- Keep commit subjects short and imperative.
- PRs should include: purpose, key changes, config/env impact, linked issue(s), and UI screenshots when relevant.
- Before requesting review, run `npm run build` and ensure formatting is clean.

## Security & Configuration Tips

- Copy `.example.env` to `.env`; never commit secrets.
- Required core services are OpenAI and Upstash; Sentry/Lemon/Segment are optional.
- Avoid sharing built Docker images that contain `.env`.
