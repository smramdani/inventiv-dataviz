# Changelog

All notable changes to Inventiv DataViz are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (MAJOR.MINOR.PATCH). For each version we list **Added**, **Changed**, **Fixed**, and **Removed** where applicable.

---

## [Unreleased]

### Added

- **Info card** (node and link selection): pop-up showing node/link details when clicking a node or an edge.
  - Default readable style (dark text on light background); customizable via `config.infoCardStyle` (colors, fonts, padding, etc.).
  - Custom content by type via `infoCardContent.getNodeRows` and `infoCardContent.getLinkRows` (Web and engine options).
  - Demo data: custom attributes for Entity (Company Name, Legal Form, City, Country) and Shareholder (First Name, Last Name, Age).
- E2E tests for info card: visibility on node/link click, Entity/Shareholder attributes, close button.
- **Documentation**: docs index (`docs/README.md`), OPEN_SOURCE_EXPERT_RECOMMENDATIONS.md, OPEN_SOURCE_IMPLEMENTATION_TODO.md (phases 1–8 for project health).
- README: Features/Docs table, 18 E2E scenarios, Web-only vs Power BI table, shortened Hello World with links to examples.

### Changed

- **Info card**: styling driven by `DEFAULT_INFO_CARD_STYLE` and optional `config.infoCardStyle`; content can be fully custom per node/link type.
- **Documentation**: CUSTOMIZATION extended with §8.2 (info card style) and §8.3 (info card content); LAYOUT_PERSISTENCE_PLAN title/status; demo/VERIFICATION in English; tests/README in English; widgets/README reflects current structure and both widgets.
- LICENSE header updated to "Inventiv DataViz", year 2026.
- VISION_AND_ROADMAP: Phase 3/4 checkboxes updated; demo/fakeGraphData path corrected.

---

## [0.0.10] - 2026-03-04

### Added

- E2E tests: Organiser (presence, no console errors, layout change, persistence after reload), Fit, links visible after expand.
- README: project layout (tests/, docs links), build commands (lint, test:e2e), Docs section.
- ESLint 9 flat config (`eslint.config.js`): lint JS only, ignore build artifacts.

### Changed

- **Documentation**: CUSTOMIZATION.md updated; edge-crossing references removed after feature removal.

### Removed

- **Edge-crossing** detection and repulsion from graph engine and config (feature reverted; layout uses standard D3 forces only).

---

## [0.0.9] - 2026-03-04

### Added

- **Tout Ouvrir / Tout Fermer** toolbar buttons for Legal Entities (expand all nodes / collapse to start).
  - Options `onOpenAll` and `onCloseAll`; Generic Graph toolbar keeps only +, −, Fit.
- **Effective opened state**: nodes whose edges are all visible are shown as “open” (styled) without requiring a click.
- E2E tests: toolbar buttons, Tout Ouvrir expands node count, Tout Fermer reduces to one node; Generic Graph has no open/close buttons.
- tests/README.md updated with new scenarios.

---

## [0.0.8] - 2026-03-04

### Added

- **Legal Entities custom style** demo: orange/violet nodes, green/blue edges by type.
- **Per-link colors**: `linkStroke` and `arrowFill` can be functions `(link) => color`; `LinkStyleContext` exported for typing.
- Config: `nodeLabelOffset` (default 5), `linkLabelOffset` (default 70).
- CUSTOMIZATION.md: per-link colors and label offsets documented.

---

## [0.0.7] - 2026-03-03

### Changed

- **Renaming for clarity**: `LegacyFullGraph` / `LegacyGraphNode` / `LegacyGraphLink` → `LegalEntitiesGraph` / `LegalEntitiesNode` / `LegalEntitiesLink`.
  - `legacyToGraphData` → `legalEntitiesToGraphData`; `parseDataViewToLegacyGraph` → `parseDataViewToLegalEntitiesGraph`.
- Demo: `buildMockDataViewFromLegalEntitiesGraph`, `__inventivDemoLegalGraph` for Legal Entities demo.
- DATA_MAPPING.md and VISION_AND_ROADMAP.md updated to use new names.

### Removed

- Unused `graphDataToLegacy()`; `legalEntitiesToGraphData` only for Legal Entities → generic mapping.

---

## [0.0.6] - 2026-03-03

### Added

- **Customization documentation**: CUSTOMIZATION.md with shapes, colors, sizes, layout (Organiser), visibility, and code examples (Generic and Legal Entities).

---

## [0.0.5] - 2026-03-03

### Changed

- **Documentation**: README and docs aligned with layout persistence behaviour and E2E test setup.

---

## [0.0.4] - 2026-03-03

### Added

- E2E test: layout persistence (save on drag, restore after reload).
- Diagnostic logs (LAYOUT_DEBUG) for load/save and engine restore.
- LAYOUT_PERSISTENCE_PLAN: layoutKey and partial restore documented.

### Fixed

- **Layout persistence**: fill `currentLastPositions` before initial zoom so zoom end does not overwrite localStorage with an empty layout.
- **Partial restore**: layoutKey per graph; only positions for existing nodes are restored; new nodes get default placement.

### Removed

- D3 force simulation after initial layout; graph uses position updates and drag only (no continuous simulation).

---

## [0.0.3] - 2026-03-03

### Added

- **Layout persistence** on drag/zoom end: `LayoutState`, `getLayoutState()`, `initialLayoutState`, `onLayoutChange`; web API `layoutKey` and localStorage; Legal Entities persist visible/opened nodes; Power BI persist property.
- **Generic Graph** in demo via web API (`createGenericGraph`).
- E2E tests with Playwright; reuse of demo server for test runs.

---

## [0.0.2] - 2026-03-03

### Added

- README / Repo link in demo app header.

---

## [0.0.1] - 2026-03-03

### Fixed

- Demo script path for GitHub Pages deployment.

---

## Pre-release (before 0.0.1)

### Added

- **Generic graph engine** (`src/graph/`): config, engine, types, mapping, adapter; configurable shapes and colors; zoom preserved on expand.
- **Web API**: `createGenericGraph`, `createLegalEntitiesGraph`; bundles `dist/inventiv-dataviz.js` and `.esm.js`.
- **Legal Entities & Generic Graph** visuals; link/arrow colors distinct from node fills.
- **Demo app** (`demo/`): Legal Entities, Generic, Species, Sentence scenarios; fake data and test UI in demo/.
- **Examples**: hello-world.html and hello-world-legal.html for minimal integration.
- **Docs**: README quick start and Hello World, GETTING_STARTED, DATA_MAPPING, VISION_AND_ROADMAP.
- **Build scripts**: build:demo, build:web, package (Power BI).
- **GitHub Actions**: deploy demo to GitHub Pages; layout persistence (getLayoutState, initialLayoutState, onLayoutChange); arrow/link sizing (share % as weight, arrowMarkerSizeMin/Max, weightToSizeCurve sqrt).
- **E2E tests**: Playwright in `tests/`, `npm run test:e2e`.
- **Docs**: LAYOUT_PERSISTENCE_PLAN, DATA_MAPPING tuning, demo VERIFICATION.md.
- README: “What is this?”, widgets overview, contact invite for custom needs.

---

[Unreleased]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.10...HEAD
[0.0.10]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/smramdani/inventiv-dataviz/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/smramdani/inventiv-dataviz/releases/tag/v0.0.1
