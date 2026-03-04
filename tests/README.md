# Tests automatisés

Tous les **tests automatisés** du projet sont ici.

## Contenu

- **E2E (démo)** — `demo.spec.js` :
  - **Legal Entities** : chargement, visibilité du graphe et de la toolbar, clic sur un nœud pour expand sans disparition du graphe.
  - **Legal Entities (custom style)** : même scénario sur la démo au style personnalisé.
  - **Persistance du layout** : drag d’un nœud, vérification du localStorage, rechargement, vérification que le layout est restauré (positions non vides).
  - **Toolbar Legal Entities** : présence des boutons « Tout Ouvrir » et « Tout Fermer ».
  - **Tout Ouvrir** : clic sur « Tout Ouvrir », vérification que le nombre de nœuds visibles augmente.
  - **Tout Fermer** : après « Tout Ouvrir », clic sur « Tout Fermer », vérification qu’il ne reste qu’un nœud (démarrage).
  - **Generic Graph** : la toolbar contient « Organiser » mais pas « Tout Ouvrir » ni « Tout Fermer ».
  - **Organiser** : présence du bouton « Organiser » (Legal Entities), clic sans erreur ni erreur console (graphe et nœuds restent visibles), layout après Organiser avec positions distinctes, persistance et restauration après rechargement.
  - **Fit** : clic sur « Fit » sans casser le graphe.
  - **Liens** : après expansion, au moins un lien (arête) visible quand il y a au moins 2 nœuds.

## Lancer les tests

À la racine du dépôt :

```bash
npm run test:e2e
```

Cela build la démo, démarre le serveur sur le port 3000, exécute les scénarios dans Chromium puis arrête le serveur.

- **Avec l’UI Playwright** : `npm run test:e2e:ui`

## Configuration

- **Playwright** : `playwright.config.js` à la racine (emplacement standard). Il pointe sur `testDir: "./tests"` et lance `npm run demo` comme serveur de test.
- **Sorties** (ignorées par Git) : `test-results/`, `playwright-report/`, `playwright/.cache/`.

## Démo manuelle

L’**application de démo** (pages, menus, données de test) est dans **[demo/](../demo/)**. Pour une vérification manuelle : `npm run demo` puis ouvrir http://localhost:3000.
