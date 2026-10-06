# RecouvIA

Outil web pour la chargée de recouvrement : préparer et enregistrer les relances de cotisations
d'assurance vie. Projet étudiant du cours GET 409 (Swiss UMEF Dakar), non officiel ; toutes les
données sont fictives.

Une relance peut être créée de trois façons :
1. choisir l'un des 20 modèles de relance intégrés ;
2. décrire la situation en texte libre ;
3. déposer une capture de preuve de paiement (Wave / Orange Money).

## Technique
- Vite + React + TypeScript (strict), tests Vitest + React Testing Library, ESLint + Prettier.
- Phase 2 : l'appel au modèle d'IA passe uniquement par une Cloud Function (`functions/`) ;
  aucune clé n'est dans le navigateur ni dans le dépôt.
- Revue de sécurité avant déploiement : `docs/security-review.md` (atelier Claude Code, E14).
- Journal des décisions : `docs/decisions.md`.

## Lancer en local
```bash
npm install
npm run dev
npm run lint && npm test && npm run build
```

## Branches
- `phase-1` : version 100 % navigateur (données fictives)
- `phase-2` : ajout de l'IA côté serveur (branche principale)
- `ralph` : itérations automatiques (atelier E10)
