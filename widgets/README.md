# Inventiv DataViz – Widgets

This repo hosts **multiple dataviz widgets** for Power BI (and browser testing).

## Current widgets

- **Legal Entities Graph** – Source: `src/visual.ts`, `src/fakeGraphData.ts`, `src/settings.ts`, `style/visual.less`.  
  Graph of entities and shareholders; explore by node, zoom, pan, share % on edges.

## Adding a new widget

1. Implement the new visual (e.g. new class in `src/` or a dedicated folder).
2. Register it in the Power BI plugin entry (and in `test/entry.ts` for local testing).
3. Add a separate `pbiviz.json` or build configuration if you need a separate `.pbiviz` package for that widget.
4. Document it in the main README and here.
