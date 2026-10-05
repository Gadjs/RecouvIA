# .claude/ralph-brief.md — RecouvIA polish
Each round:
1. Review the current UI with the frontend-design skill: layout, typography, spacing, states, mobile.
2. List issues, rank them by impact/effort, fix the top 3.
3. Run `npm run build`; fix any error.
4. Append a dated entry to docs/decisions.md ("Ralph round n: what changed").

Quality bar: looks like a real tool a collections officer would use every day, not a demo. NSIA-inspired palette (navy #2B2B5E, gold #D5A00A), clear hierarchy, consistent spacing, works at 360 px and on desktop, loading / empty / error states everywhere. French UI copy.
Add if missing: header with the app name and today's date; per-policy reminder counter; filter by status (À jour / Échéance proche / En retard / Promesse de paiement / Escalade conseiller); colour-coded status badges; card layout for journal entries.

Output <promise>POLISHED</promise> only when every point of the quality bar is genuinely met and the build passes.
Never touch functions/, .env*, functions/.secret.local or Firebase config. Fictional data only.
