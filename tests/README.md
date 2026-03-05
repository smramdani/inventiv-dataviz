# Automated tests

All **automated tests** for the project are here (18 E2E scenarios).

## Content

- **E2E (demo)** — `demo.spec.js`:
  - **Legal Entities:** load, graph and toolbar visible, click node to expand without graph disappearing.
  - **Legal Entities (custom style):** same on the custom-style demo.
  - **Layout persistence:** drag a node, check localStorage, reload, verify layout restored.
  - **Toolbar (Legal Entities):** "Tout Ouvrir" and "Tout Fermer" buttons present.
  - **Tout Ouvrir:** click opens all nodes (visible count increases).
  - **Tout Fermer:** after open all, click closes to single start node.
  - **Generic Graph:** toolbar has "Organiser" but not "Tout Ouvrir" / "Tout Fermer".
  - **Organiser:** button present, click runs without error, layout and positions persist after reload.
  - **Fit:** click Fit without breaking the graph.
  - **Links:** after expand, at least one link visible when ≥2 nodes.
  - **Info card:** node click shows card (Entity: Company Name, Legal Form, City, Country; Shareholder: First Name, Last Name, Age); link click shows card (Weight); close button hides card.

## Running tests

From the **repository root**:

```bash
npm run test:e2e
```

This builds the demo, starts the server on port 3000, runs the scenarios in Chromium, then stops the server.

- **With Playwright UI:** `npm run test:e2e:ui`

## Configuration

- **Playwright:** `playwright.config.js` at project root. It uses `testDir: "./tests"` and runs `npm run demo` as the test server.
- **Outputs** (git-ignored): `test-results/`, `playwright-report/`, `playwright/.cache/`.

## Manual demo

The **demo app** (pages, menus, test data) is in **[demo/](../demo/)**. For manual verification: `npm run demo` then open http://localhost:3000.
