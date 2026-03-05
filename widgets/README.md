# Inventiv DataViz – Widgets

This repo hosts **graph-drawing widgets** that work as **web components** and as **Power BI custom visuals**.

## Vision

- **Generic Graph:** Reusable, configurable graph engine for any network (colors, shapes, layout, info card). Web API: `createGenericGraph(container, data, options)`.
- **Legal Entities & Shareholders Graph:** Specialized for corporate structures (entities, shareholders, ownership %), built on the same engine. Web API: `createLegalEntitiesGraph(container, data, options)`; Power BI: `.pbiviz` package.
- **Dual delivery:** Both widgets available as Web (script/ESM) and, for Legal Entities, as a Power BI custom visual.

Full design and roadmap: **[../docs/VISION_AND_ROADMAP.md](../docs/VISION_AND_ROADMAP.md)**.

## Current widgets

| Widget | Web API | Power BI | Source |
|--------|---------|----------|--------|
| **Generic Graph** | `createGenericGraph(container, data, options?)` | — | `src/graph/`, `src/web/index.ts` |
| **Legal Entities Graph** | `createLegalEntitiesGraph(container, data, options?)` | ✅ `.pbiviz` | `src/visual.ts`, `src/graph/adapter.ts`, `src/web/index.ts` |

Both share the same core: `src/graph/` (config, engine, types, adapter). Demo: [../demo/](../demo/).

## Current structure

- **Core (generic):** `src/graph/` — `config.ts`, `engine.ts`, `types.ts`, `adapter.ts` — no Power BI dependency.
- **Web API:** `src/web/index.ts` — `createGenericGraph`, `createLegalEntitiesGraph`; builds and options (config, layoutKey, infoCardContent, etc.).
- **Power BI – Legal Entities:** `src/visual.ts`, `src/settings.ts` — DataView → adapter → `renderGraph`; format pane and layout persistence.

## Adding a new widget

1. Reuse `src/graph/` (engine + config). Add mapping/adapter if needed.
2. Add Web entry in `src/web/index.ts` and, for Power BI, a visual class + capabilities.
3. Register in the Power BI plugin entry and in `demo/` (or test entry) for local testing.
4. Document in the main [README](../README.md) and here.
