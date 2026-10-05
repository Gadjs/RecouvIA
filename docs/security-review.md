# RecouvIA — Pre-deploy security review

- Date: 2026-10-05
- Branch: `phase-2`
- Reviewer: `firebase-reviewer` subagent (read-only; no `.env*` or `functions/.secret.*` contents were read)
- Scope: `firestore.rules` / `storage.rules` (if any), `functions/src/**`, `src/**`, `dist/`, `.gitignore`, `.claude/settings.json`
- Status: **findings only, no fix applied.** Fixes below are proposals.

## Summary

1 Critical-for-enablement item (no rules files), 2 High, 3 Medium, 3 Low, plus Info.
The Gemini key is handled correctly and no secret or Admin SDK reached `dist/` or `src/`.

## Critical

### C1. No `firestore.rules` or `storage.rules`; `firebase.json` declares neither
- File: `firebase.json:1-15` (only a `functions` block and an emulators block). A glob for `**/*.rules` found nothing.
- Why it matters: the app uses neither Firestore nor Storage today, so nothing is exposed yet. If either product is enabled (`firebase init`, console), test-mode defaults or a quick `allow read, write: if true` would expose policyholder data and payment proofs.
- Proposed fix, before enabling either product:
  - Create both rules files and register them in `firebase.json` (`firestore.rules`, `storage.rules`).
  - Start from deny-all: `match /{document=**} { allow read, write: if false; }`.
  - Require `request.auth != null` and an owner check (`request.auth.uid == resource.data.ownerUid`, or `userId` in the path) on every user path.
  - Validate fields and types on write.
  - Storage: enforce `contentType` in image/(png|jpeg|webp) and `request.resource.size < 4*1024*1024`. Preferably do not store payment proofs at all.
  - Test the rules with the emulator.

## High

### H1. Callable functions have no authentication, no App Check, no per-caller rate limit
- Files: `functions/src/analyze-situation.ts:28-34`, `functions/src/read-payment-proof.ts:25-32`.
- Why it matters: once deployed, anyone with the URL can burn Gemini quota and spend (4 MB images × `maxInstances: 5`) or use it as a free LLM proxy. The app has no Firebase Auth, so there is no officer identity.
- Proposed fix:
  - `enforceAppCheck: true` (optionally `consumeAppCheckToken` for replay protection).
  - `if (!request.auth) throw new HttpsError('unauthenticated', ...)`, restricted to an allow-list or custom claim for collections officers.
  - Google Cloud budget alert and Gemini quota cap.
  - Consider a per-uid rate limit.

### H2. Production client is not wired to a real backend
- File: `src/lib/firebase.ts:9,21-25`.
- Finding: projectId is the offline `demo-recouvia`; the emulator connection is made only under `import.meta.env.DEV`. The `dist/` bundle therefore targets a non-existent project.
- Why it matters: the deploy will fail at runtime or tempt someone to hard-code config in a hurry. A real deploy needs a real project, App Check initialisation and Auth, all absent from `src/`.
- Proposed fix: supply the (non-secret) web config via Vite env vars and add `.env.example` with placeholder names only (see L3).

## Medium

### M1. Payment-proof personal data persisted in browser localStorage
- Files: `src/lib/local-storage-relance-repository.ts:27-50,109-116`, `src/features/reminders/ProofFields.tsx:94-95`.
- Why it matters: `payerName` and `transactionReference` extracted from receipts are stored unencrypted under `recouvia.relances.v1`. On a shared or lost machine they stay readable. The image itself is not stored (asserted in `src/ai-flows.test.tsx:149`).
- Proposed fix: persist only what the log needs (operator, amount, date, masked reference); make `payerName` optional or drop it; add retention and clear-data controls; record the decision in `docs/decisions.md`.

### M2. Images and free text are forwarded to a third party (Gemini)
- Files: `functions/src/read-payment-proof.ts:41-48`, `functions/src/analyze-situation.ts:43-48`.
- Why it matters: inputs can contain real personal data (phone numbers, names, policy numbers) and leave your infrastructure. Whether the free API tier trains on submitted data depends on the plan. The functions themselves do not store or log them.
- Proposed fix: use a paid/Vertex tier with no-training terms; confirm the legal basis (Senegal personal data law 2008-12, insurance sector); disclose in the UI that data goes to an AI provider; advise users not to paste phone or policy numbers in the free-text field.

### M3. Error handling may leak raw SDK error text into logs
- File: `functions/src/gemini.ts:55` and `:63`.
- Why it matters: `errorMessage(error)` logs the full SDK error text. For a rejected output (line 63), a `JSON.parse` error can echo a snippet of model output, which may contain `payerName` or a reference.
- Proposed fix: log only `error.name` / HTTP status, not `.message`, at line 63.

## Low

### L1. Input schema does not verify base64 is really an image of the claimed MIME type
- File: `functions/src/schemas.ts:57-65`.
- Size and regex checks are good; content is validated only by Gemini. A mismatch merely costs a call.
- Proposed fix (optional): check magic bytes (PNG/JPEG/WEBP) before calling Gemini.

### L2. Model name and retry fallback hard-coded
- File: `functions/src/gemini.ts:11` (`gemini-3.8-flash`).
- Operational, not security: a wrong or retired name makes every call burn 2 attempts and fail with `unavailable`.
- Proposed fix: verify the model IDs against the current Gemini model list before deploy.

### L3. `.env.example` missing
- Repo root (only `.gitignore:25` references it). Required by CLAUDE.md "Never" and needed once web config moves to Vite env vars (H2).
- Proposed fix: add `.env.example` with placeholder names only.

### L4. `.claude/settings.json` deny rules only match the repo root
- `./.env`, `./.env.*` and `./functions/.secret.*` are denied, but a nested `.env` (e.g. `functions/.env`, which Firebase Functions also loads) is not.
- Proposed hardening (not applied): add `Read(**/.env*)`, `Read(**/.secret.*)` and matching `Edit` denies.

## Info

- `dist/` exists (`dist/index.html`, `dist/assets/index-DIdFDnfD.js`, `dist/assets/index-B0gd57Vt.css`) and is gitignored (`.gitignore:5`). Only React/Firebase SDK internals call `console.*`; no `sourceMappingURL`. It is a stale build: rebuild before deploy.
- Prompt injection: both system prompts treat user and image content as data. Outputs are zod-validated on the server (enums, length caps, ISO date regex) and re-parsed on the client (`parseSituationSuggestion`, `parseProofReading`).
- `maxInstances: 5`, 60 s timeout and size caps limit blast radius but not abuse (see H1).
- `firebase.json` functions ignore list includes `*.local`, so `functions/.secret.local` is not uploaded at deploy.

## Checked and clean

- Secrets: `GEMINI_API_KEY` declared only via `defineSecret` (`functions/src/gemini.ts:8`) and bound with `secrets: [GEMINI_API_KEY]` in both functions; never logged (line 32 logs only that it is empty). No `process.env` key usage or hard-coded keys in `functions/src`.
- Input validation present and strict on both functions: text 1–2000 chars; image base64 regex, 4 MB cap with pre-decode length cap, MIME allow-list.
- Logging: no prompt text, image or payer data on the success path. Images are passed inline to Gemini and never written to disk, Storage or Firestore.
- Client bundle and `src/`: no `AIza`, `api_key`, `firebase-admin`, `private_key`, `GEMINI` or `VITE_*` secrets in `src/`, `dist/`, `index.html`, `vite.config.ts`. Only client config is `{ projectId: 'demo-recouvia' }`. No `dangerouslySetInnerHTML`, `innerHTML` or `eval`.
- Sample data: `src/data/sample-polices.ts` contains only `DEMO-0001..0003`; a phone-number regex over `src/` found nothing.
- `.gitignore` covers `.env`, `.env.*` (with `!.env.example`), `*serviceAccount*.json`, `functions/.secret.*`, `dist/`, `node_modules/`, `.claude/settings.local.json`; `functions/.gitignore` covers `lib/` and `node_modules/`.
- No Admin SDK in the client or outside the `functions` package.

Not found: `firestore.rules`, `storage.rules`, `.env.example`.
