# Vérification de la démo

## Tests E2E automatisés (exécutables par la CI ou en local)

Les vérifications peuvent être lancées automatiquement :

```bash
npm run test:e2e
```

Cela build la démo, démarre le serveur sur le port 3000, lance Chromium (Playwright) et exécute :

1. **Legal Entities Graph** : chargement → présence du graphe et de la toolbar (Fit) → clic sur le premier nœud → le graphe et la toolbar restent visibles, aucune erreur console.
2. **Legal Entities (custom style)** : même scénario sur la deuxième entrée du menu.

En cas d’échec, Playwright peut relancer les tests avec l’UI : `npm run test:e2e:ui`.

---

## Logs attendus dans la console (niveau Debug)

Ouvre les DevTools (F12) → Console. Active « Verbose » ou « Debug » pour voir les messages `console.debug`.

### Au chargement de « Legal Entities Graph »

1. `[Inventiv DataViz] LegalEntities render 1 nodes initial` — premier rendu, 1 nœud visible (fermé/gris).
2. `[Inventiv DataViz] renderGraph: start 1 nodes` — le moteur démarre.
3. `[Inventiv DataViz] scheduleLayoutChange: debounce` — peut apparaître après le premier `zoom.transform` (restauration zoom).
4. `[Inventiv DataViz] renderGraph: done 1 nodes` — rendu terminé.
5. (Optionnel, ~400 ms plus tard) `[Inventiv DataViz] onLayoutChange: fire` — persistance du layout déclenchée.

### Au clic sur le nœud (ouvrir)

1. `[Inventiv DataViz] LegalEntities render N nodes expand:<nodeId>` — re-rendu avec N nœuds (ex. 5), expansion du nœud cliqué.
2. `[Inventiv DataViz] renderGraph: start N nodes`
3. `[Inventiv DataViz] renderGraph: done N nodes`

Le graphe et les boutons + / − / Fit doivent rester visibles. Aucune erreur rouge dans la console.

### Ce qui indique un problème

- **Erreur** `Cannot access 'layoutChangeTimeout' before initialization` → correctif TDZ non pris en compte (rebuild nécessaire).
- **Erreur** `persistProperties` / `undefined` → ancien code sans garde `host?.persistProperties`.
- Le graphe disparaît au clic → vérifier qu’aucune exception n’est levée (stack trace dans la console).

## Checklist rapide

- [ ] Un seul nœud visible au chargement, **gris** (fermé).
- [ ] Clic sur le nœud → le nœud s’ouvre (couleur « ouverte »), les voisins apparaissent.
- [ ] Le graphe et les boutons + / − / Fit **restent visibles** après le clic.
- [ ] Aucune erreur (rouge) dans la console.
- [ ] Les logs `[Inventiv DataViz]` apparaissent comme ci-dessus (avec niveau Debug activé).
