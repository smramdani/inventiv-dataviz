# Inventiv DataViz – Widgets

This repo hosts **graph-drawing widgets** that work as **web components** and as **Power BI custom visuals**.

## Vision

- **Generic Graph Widget**: One reusable, configurable graph engine (colors, style, distances, sizes, content, behavior) for any kind of network. Current behavior is the default; config params allow many graph styles.
- **Legal Entities & Shareholders Graph Widget**: Specialized for corporate structures (entities, shareholders, ownership %), built on top of the Generic Graph Widget to reuse the same logic and code.
- **Dual delivery**: Both widgets are usable as web widgets and as Power BI packaged plugins (`.pbiviz`).

Full design and roadmap: **[../docs/VISION_AND_ROADMAP.md](../docs/VISION_AND_ROADMAP.md)**.

## Current widgets

| Widget | Source | Description |
|--------|--------|-------------|
| **Legal Entities Graph** | `src/visual.ts`, `src/settings.ts`, `style/visual.less` | Graph of entities and shareholders (data from Power BI DataView); expand on click, zoom, pan, share % on edges. Demo: [demo/](../demo/) folder. |

## Planned structure (after refactor)

- **Generic Graph**
  - Core: `src/graph/` – `config.ts`, `engine.ts`, `types.ts` (no Power BI dependency).
  - Power BI: `src/visual-generic.ts` – uses graph engine + Format pane → config.
  - Web: `src/web/` – API e.g. `createGenericGraph(container, data, options)`.
- **Legal Entities Graph**
  - Power BI: `src/visual-legal-entities.ts` – maps DataView (From, To, Shares) to generic graph + Legal-Entities config; uses same graph engine.
  - Web: same engine + `createLegalEntitiesGraph(container, data, options)`.

## Adding a new widget

1. Implement the visual (reuse `src/graph/` when applicable).
2. Register it in the Power BI plugin entry (and in `test/entry.ts` for local testing).
3. Add or extend `pbiviz.json` / build config if you need a separate `.pbiviz` for that widget.
4. Document it in the main README and here.
