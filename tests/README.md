# Tests automatisés

Tous les **tests automatisés** du projet sont ici.

## Contenu

- **E2E (démo)** — `demo.spec.js` : tests Playwright sur la page de démo (chargement du graphe, clic sur un nœud, pas de disparition, pas d’erreur console).

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
