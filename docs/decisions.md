# Decisions log

Append-only, dated. Newest entries at the bottom.

## 2026-10-05 — Initial build

### What
Phase 1, fully client-side, fictional data only:

- **Template library**: 20 built-in reminders (`src/features/templates/templates-data.ts`),
  accent/case-insensitive search over title, statut, canal, ton, step and message.
  Each template has a French sample message with placeholders (`{nom}`, `{police}`,
  `{echeance}`, `{montant}`, `{arriere}`, `{date_promesse}`, `{moyen_paiement}`,
  `{conseiller}`) and a Wolof version left as `[à valider]`. "Utiliser ce modèle"
  pre-fills the journal form.
- **Journal des relances**: log a reminder for a fictional policy number (step, canal,
  statut, sent date, note), counter per police, duplicate and delete (inline confirm),
  filter by police.
- **Persistence**: `RelanceRepository` interface (`src/lib/relance-repository.ts`),
  implemented on `localStorage` under key `recouvia.relances.v1`. The interface is async
  so a database can replace it by changing one line in `App.tsx`.
- Single page, no router, no auth, no UI library, plain CSS (light/dark).

### Step → canal / tone mapping (single source: `src/domain/relance-steps.ts`)

| Step  | Canal      | Ton      |
| ----- | ---------- | -------- |
| J-3   | SMS        | Courtois |
| J-1   | WhatsApp   | Courtois |
| J0    | SMS        | Neutre   |
| J+1   | SMS        | Neutre   |
| J+3   | appel      | Neutre   |
| J+7   | WhatsApp   | Ferme    |
| J+10  | appel      | Ferme    |
| J+15  | SMS        | Formel   |
| J+21  | appel      | Formel   |
| J+30  | conseiller | Formel   |

Templates store only `step` and `statut`; canal and ton are derived from the step, so the
mapping lives in one place. The 20 templates are two per step, differing by statut
(`Échéance proche`, `En retard`, `Promesse de paiement`, `Escalade conseiller`) or situation.
This mapping is a **working proposal** to be validated by the collections team.

### Why
- Derived canal/ton avoids drift between templates and the rules (CLAUDE.md: define once).
- Async repository + validated parsing keeps the storage swap local and tolerates
  corrupted `localStorage` (invalid items are dropped, never crash the UI).
- Police numbers are normalised to upper case and format-checked (4–20 chars, letters,
  digits, hyphens) so counters group correctly. Suggestions are `DEMO-000x` fixtures.
- No amounts or dates are invented: messages use placeholders; dates in the log come
  from the user (default: today, editable).

### Trade-offs / alternatives
- **Derived canal per template** means two templates on the same step share a canal/tone;
  per-template overrides were rejected to avoid duplicating the mapping.
- **Templates are not filled** with real values in Phase 1 (no assuré data model yet);
  the officer sees raw placeholders. Template filling is a Phase 2 candidate.
- **localStorage**: per-browser, ~5 MB, no multi-user or sync. Acceptable for Phase 1.
  Entries are stored newest-first; the list is unpaginated.
- **No entry editing**: only add / duplicate / delete, as requested. Duplicate keeps the
  same sent date (copy as-is), and a new id and creation time.
- `statut` is chosen manually in the form (not computed from dates) — status computation
  from échéance/payments needs real data and is out of scope.
- **Tooling**: TypeScript pinned to 6.0.3 because `typescript-eslint` 8.71 supports
  `<6.1`; TypeScript 7 is available but unsupported by the linter. Local Node was 24
  (CLAUDE.md targets 22 LTS); `engines` is `>=22`.
- Wolof texts are placeholders only — to be written and validated by a native speaker.

## 2026-10-05 — AI backend

Two callable Cloud Functions (2nd gen, TypeScript) in `functions/`, run **only on the Firebase
emulator** with the offline project id `demo-recouvia` (no real project, no deploy). The
frontend is untouched and does not call them yet.

- `analyzeSituation({ text })` → `suggestedStatus`, `suggestedChannel`, `timing`, `tone`,
  `draftMessage` (placeholders `{nom}`, `{police}`, `{echeance}`), `reasoning`, `confidence`.
- `readPaymentProof({ imageBase64, mimeType })` → `operator`, `amount`, `currency`, `date`,
  `transactionReference`, `payerName`, `confidence`, `warning`; any field not visible is `null`.

### Why / how
- SDK `@google/genai` (current official Google Gen AI SDK for Node), model `gemini-3.8-flash` with `gemini-3.5-flash` as retry fallback (3.8 and 3.7 returned 503 "high demand" in testing)
  (constant `GEMINI_MODELS` in `functions/src/gemini.ts`; the model ID was read from the Gemini
  docs and could not be exercised against the live API during the build — confirm on first call).
- Key read with `defineSecret("GEMINI_API_KEY")`; in the emulator it comes from
  `functions/.secret.local`, which is git-ignored and denied (Read/Edit) in `.claude/settings.json`.
- Inputs validated with zod (text 1–2000 chars; image raw base64, png/jpeg/webp, ≤ 4 MB decoded).
  Model output is requested in JSON mode with the zod-derived JSON schema, then re-validated with
  zod; one retry on invalid output, then an `internal` error. Prompts/images are never logged.
- Enums mirror the domain (statuts, canaux, steps `J-3`…`J+30`, tons). They are duplicated in
  `functions/src/schemas.ts` because `functions/` is a separate package; the step → canal/tone
  mapping is NOT duplicated (the model proposes channel and tone, the frontend should reconcile
  with `src/domain/relance-steps.ts`).

### Trade-offs / alternatives
- No authentication or App Check yet (demo project, emulator only): required before any real deploy.
- Context7 could not be used (OAuth not completed); docs were checked on the official Google
  pages and the SDK's published typings instead.
- Suggestions are advisory: the officer must confirm; amounts/dates are never invented.
- Not tested against the live Gemini API (needs the key); only build, schema checks and emulator
  loading/input rejection were verified.

## 2026-10-05 — Frontend AI flows

The journal now has three ways to add an entry, as tabs: **Modèles** (unchanged),
**Décrire** (free text → `analyzeSituation`) and **Preuve de paiement** (screenshot →
`readPaymentProof`). Each AI result opens a review card (suggested status/channel/step/tone,
confidence, reasoning or warning) followed by the entry form pre-filled with the result; every
field is editable and nothing is saved until the officer submits.

### Decisions
- **Firebase JS SDK** (`firebase` 12.19.0, exact pin) initialised lazily in `src/lib/firebase.ts`
  with only `projectId: "demo-recouvia"` — no API key or other secret in the client — region
  `europe-west1`, and `connectFunctionsEmulator(127.0.0.1:5001)` when `import.meta.env.DEV`.
  A production build would call the real (non-existent) project: deploying needs a real project,
  auth/App Check and a config decision first.
- **`AiService` interface** (`src/lib/ai-service.ts`) with a Firebase implementation, mirroring
  `RelanceRepository`: the UI never imports Firebase, and tests inject a fake. Function results are
  re-validated in the browser (`src/domain/ai-results.ts`, type guards) because the callable
  response is untyped; a malformed answer becomes a friendly "réponse inattendue" error.
- **Entry model extended**: `source` (`modele` | `description` | `preuve`), `message` (the possibly
  edited text) and `proof` (operator, amount, currency, date, reference, payer; `null` when not an
  proof). Stored entries from before this change load with `source: modele`, `message: ""`,
  `proof: null` (no storage key bump). Tone is shown in the review but not stored: it is derived
  from the step (single mapping in `relance-steps.ts`).
- **Screenshots are never stored.** The image is resized in the browser (longest side ≤ 1600 px,
  JPEG, re-encoded at lower quality if needed to stay under 4 MB), sent once, and only the
  extracted fields are persisted. Preview uses an in-memory data URL.
- **Police number is always typed by the officer**: neither function returns one, and none is
  invented. The AI suggestions' canal is kept as returned (not re-derived from the step).
- **Defaults for a proof entry** (step `J0`, statut `À jour`, canal from the step) are neutral
  starting values for the officer to change, not computed facts. The payment date is edited as a
  calendar date, so the time of day read by the model is dropped.
- All panels stay mounted (hidden) so a result under review survives a tab switch; picking a
  template in the library switches back to **Modèles**.
- Errors: `unavailable` (emulator stopped, offline or Gemini overloaded), timeout, not configured,
  invalid input/response and unreadable/oversized image each have a French message in `src/i18n/fr.ts`.

### Verification and limits
- Unit/UI tests use a fake `AiService` (flows, edit-then-save, error display, persistence, amount
  validation, no image in storage). The real client was also run against the emulator and Gemini
  (both functions answered; empty input mapped to `invalid-input`).
- The browser path itself (canvas resizing, file picker, visual layout) was **not** exercised in a
  real browser during this change; only jsdom with a mocked `prepareImage`. To check by hand: start
  the emulator and `npm run dev`.
- Gemini returned 503 "high demand" / 429 quota during testing; the backend retries once on a
  fallback model, the UI offers a retry through the same button.
- `CLAUDE.md` still says `situation/`, `proof-upload/`, `components/` do not exist; update its
  "Phase 1 status" and the Commands section (dev needs the emulator) when convenient.
