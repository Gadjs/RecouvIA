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
