# CLAUDE.md — RecouvIA

## What this is
RecouvIA is a web app that helps a collections officer at NSIA Vie Assurances (Dakar)
prepare and log premium reminders ("relances"). An entry can be added three ways:
1. Pick one of the 20 built-in reminder templates.
2. Describe a situation in free text.
3. Upload a payment-proof screenshot (Wave / Orange Money).

Phase 1 is fully client-side with fictional data. Phase 2 may call an LLM, only through
a server-side function (never directly from the browser).

## Stack & versions
- Vite + React + TypeScript (strict). Node 22 LTS.
- Exact versions are pinned in `package.json`; treat it as the source of truth and
  update this section when a major version changes.
- TypeScript stays on 6.0.x until `typescript-eslint` supports 7 (it requires `<6.1`).
- Tests: Vitest + React Testing Library.
- Lint/format: ESLint + Prettier (configs live at the repo root).
- Server-side function (Phase 2): `api/` (serverless handler). Secrets exist only there.

## Commands
- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc --noEmit`) then production build
- `npm test` — run Vitest once (`npm run test:watch` for watch mode)
- `npm run lint` — ESLint
- `npm --prefix functions run build` — compile the Cloud Functions (`functions/`)
- `firebase emulators:start --only functions --project demo-recouvia` — run the AI backend locally
  (offline demo project; Gemini key goes in `functions/.secret.local`, never read or committed)

Run `npm run lint && npm test && npm run build` before calling any work done.

## Folder structure (target)
```
CLAUDE.md
docs/
  decisions.md          # dated log of design/tech decisions (append-only)
src/
  main.tsx, App.tsx
  components/           # presentational React components
  features/
    templates/          # the 20 built-in reminder templates + picker
    situation/          # free-text entry
    proof-upload/       # screenshot upload (Wave / Orange Money)
    reminders/          # reminder log: list, filter, detail
  domain/               # pure TS: types, enums, relance rules (no React, no I/O)
  data/                 # fictional seed data and fixtures only
  lib/                  # small helpers (dates, formatting, storage)
  i18n/                 # French UI strings
functions/              # Firebase Cloud Functions (Gemini calls), holds all secrets
api/                    # server-side functions (Phase 2), holds all secrets
tests/                  # shared test utilities; unit tests sit next to the code
```
Phase 1 status: `templates/` and `reminders/` are built; `situation/`, `proof-upload/`,
`components/` and `api/` do not exist yet (create them when the feature lands).
The AI backend lives in `functions/` (Firebase callable functions `analyzeSituation` and
`readPaymentProof`, emulator only); the frontend does not call it yet.
Persistence goes through `RelanceRepository` (`src/lib/relance-repository.ts`); features
depend on that interface, never on `localStorage` directly. The step → canal/tone
mapping lives in `src/domain/relance-steps.ts`; templates store only `step` + `statut`.

If the real layout differs from this, fix the code or this section — do not leave
them out of sync.

## Conventions
- TypeScript `strict: true`. No `any`; use `unknown` and narrow. No `@ts-ignore`
  without a one-line reason.
- Model domain concepts as union types / enums, not loose strings.
- Naming: `PascalCase` components and types, `camelCase` functions and variables,
  `UPPER_SNAKE_CASE` constants, `kebab-case` for non-component file names.
  One component per file, file named after it.
- Code, identifiers, comments, commit messages: **English**.
- All user-facing copy: **French** (formal "vous"), kept in `src/i18n/`, never
  hard-coded in JSX.
- Domain terms are the French ones below; keep them as identifiers where it aids
  clarity (e.g. `police`, `echeance`, `arriere`) rather than translating them.
- Dates: ISO 8601 in data, formatted for `fr-SN`/`fr-FR` only at display time.
  Amounts: integers in XOF (FCFA), no decimals.
- Prefer pure functions in `domain/`; keep side effects at the edges.
- Test business rules (status computation, relance step, template filling) with
  unit tests; test UI by behavior, not implementation details.
- Accessibility basics: labels on inputs, keyboard-reachable actions, alt text.

## Domain terms
- **Police**: the insurance contract/policy, identified by a policy number.
- **Assuré**: the policyholder being reminded.
- **Prime**: the premium the assuré owes for a period.
- **Échéance**: the due date of a prime.
- **Arriéré**: the overdue, unpaid amount accumulated past échéance.
- **Statut** (exactly one per police):
  `À jour` · `Échéance proche` · `En retard` · `Promesse de paiement` · `Escalade conseiller`
- **Canal** (how the reminder is delivered):
  `SMS` · `appel` · `WhatsApp` · `conseiller`
- **Relance**: a reminder, positioned relative to the échéance from `J-3` (before)
  to `J+30` (after). The step-to-canal/tone mapping is defined once in
  `src/domain/` and `docs/decisions.md`; do not duplicate it elsewhere.

Use these labels verbatim in the UI; define them once as types in `src/domain/`.

## Workflow
1. **Plan** — for anything beyond a trivial fix, state the plan (files, approach,
   risks) before editing. Ask when requirements are ambiguous.
2. **Implement** — small, focused changes; follow the conventions above.
3. **Test** — add or update tests, then run lint, tests and build.
4. **Document** — record any non-obvious decision (what, why, alternatives) in
   `docs/decisions.md` with the date; update this file if a convention changed.

## Never
- Never commit `.env*` files; keep them in `.gitignore`. Provide `.env.example`
  with placeholder names only.
- Never put API keys or secrets in client code or `VITE_*` variables. LLM calls go
  through the server-side function only.
- Never use real policyholder data (names, phone numbers, policy numbers,
  screenshots). Fictional data only, clearly fake, in `src/data/`.
- Never invent amounts or dates: take them from the input or fixtures, or leave
  the field empty/ask. Templates use placeholders, not made-up figures.
- Never log or persist uploaded screenshots or personal data beyond what the
  feature needs.
