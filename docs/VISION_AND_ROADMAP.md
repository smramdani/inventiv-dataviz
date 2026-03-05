# Inventiv DataViz – Vision, Design & Roadmap

## Vision

Inventiv DataViz aims to deliver **two complementary graph-drawing products** that share the same core:

1. **Generic Graph Widget** – A reusable, highly configurable graph visual for any kind of network (nodes + links), with customization of colors, styles, distances, sizes, labels, and behavior.
2. **Legal Entities & Shareholders Graph Widget** – A specialized widget for corporate structures (legal entities, shareholders, ownership %), built on top of the generic widget to maximize code reuse.

Both widgets are delivered in **two forms**:

- **Web widgets** – Standalone JavaScript/TypeScript components that can be embedded in any web app (React, Vue, vanilla JS, etc.).
- **Power BI custom visuals** – Packaged `.pbiviz` plugins for the Power BI ecosystem, so the same visuals can be used in reports and dashboards without leaving the BI platform.

---

## Target 1: Generic Graph Drawing Widget

### Goals

- Draw **any** graph: nodes and links with optional weights/categories.
- **Configurable** via a single options/config object (and, in Power BI, via the Format pane):
  - **Colors**: node fill/stroke by type or state (e.g. open/closed, selected), link stroke, labels.
  - **Style**: node shape (circle, rect, etc.), link stroke width, arrows on/off, curved/straight lines.
  - **Layout**: default link distance, node size (radius or width/height), collision radius, force strengths, center pull.
  - **Content**: node label field, link label (e.g. weight), tooltips.
  - **Behavior**: expand-on-click (show neighbors) on/off, default start node, zoom extent, etc.
- **Default parameters** should match current behavior (e.g. current distances, sizes, colors) so existing use cases keep working.
- **Data contract**: minimal generic format, e.g. `{ nodes: [{ id, label?, type?, ... }], links: [{ source, target, weight?, ... }] }`.

### Design

- **Core module** (e.g. `src/graph/` or `src/generic-graph/`):
  - **GraphEngine** or **GenericGraphVisual**: owns D3 simulation, zoom/pan, drag, rendering (nodes, links, labels).
  - **GraphConfig** (TypeScript interface): all customization params (colors, sizes, distances, behavior flags).
  - Default config object that mirrors current hardcoded values in `visual.ts`.
- **Rendering**: one place for SVG (circles, lines, arrows, labels); colors/sizes come from config.
- **No Legal-Entities-specific logic** in this layer (e.g. no “Entity vs Shareholder” semantics); node/link types are just strings or categories for styling.

### Customization surface (config params)

| Category   | Examples |
|-----------|----------|
| **Colors** | `nodeFillByType`, `nodeStroke`, `linkStroke`, `labelColor`, `openNodeFill`, `closedNodeFill` (or by type) |
| **Sizes** | `nodeRadius` (or per-type), `nodeRadiusDefault`, `linkStrokeWidth`, `labelFontSize` |
| **Layout** | `linkDistance`, `linkStrength`, `chargeStrength`, `chargeDistanceMax/Min`, `collisionRadiusPadding`, `centerStrength`, `placeNewNodesRadius` |
| **Content** | `nodeLabelField`, `linkLabelField`, `showLinkLabel`, `tooltipFields` |
| **Style** | `nodeShape`, `showArrows`, `arrowMarkerId`, `linkCurvature` |
| **Behavior** | `expandOnClick`, `defaultStartNodeId`, `zoomExtent`, `fixNodesAfterExpand` |

---

## Target 2: Legal Entities & Shareholders Graph Widget

### Goals

- **Specialized** for legal-entity and shareholder networks: entities, persons, ownership shares, % on edges.
- **Reuses** the Generic Graph Widget: same layout engine, zoom, pan, drag, same rendering pipeline.
- **Adds** only:
  - Semantic types: e.g. `Entity` vs `Shareholder` (or configurable type names).
  - Arrow direction: shareholder → entity.
  - Share % on edges (from `shares` and total shares per entity).
  - Expand-on-click semantics: “open” entity to show shareholders and sub-entities.
  - Default styling (e.g. entity = blue when open, grey when closed; shareholder = green when open).
  - Data mapping: From / To / Shares (and optional tooltip fields).

### Design

- **LegalEntitiesGraphVisual** (or similar name):
  - **Uses** Generic Graph Widget internally: builds `GraphConfig` from Legal-Entities defaults + Format pane (or web options).
  - **Maps** Power BI or web input (From, To, Shares) into generic `nodes` + `links` (with `type`, `shares`, etc.).
  - **Adds** link label formatter: e.g. “42%” from shares/total.
  - **Adds** arrow marker and direction logic (shareholder → entity).
- **Data contract**: `From`, `To`, `Shares` (and optionally node labels, types); internally converted to generic graph + config.

### Code reuse

- All D3 simulation, zoom, pan, drag, and SVG rendering live in the **generic** module.
- Legal Entities widget = **thin adapter**: data mapping + config defaults + optional link labels and arrow direction.
- Shared code paths: one place to fix bugs and add features (e.g. new layout options) for both widgets.

---

## Target 3: Web Widgets + Power BI Plugins

### Goals

- **Same logic** runs in:
  - **Web**: embeddable script or npm package; API like `mount(element, data, options)`.
  - **Power BI**: custom visual; data from DataView, options from FormattingSettings.
- **Packaging**:
  - **Web**: UMD/ESM bundle (e.g. `dist/inventiv-dataviz.js`) that can be loaded in a page or bundled by the host app.
  - **Power BI**: one or more `.pbiviz` packages (e.g. `inventivGenericGraph.pbiviz`, `inventivLegalEntitiesGraph.pbiviz`).

### Design

- **Unified core** (generic graph engine + config) is **environment-agnostic** (no Power BI API in core).
- **Adapters**:
  - **Power BI adapter**: implements `IVisual`; on `update()`, maps DataView → generic nodes/links and FormattingSettings → `GraphConfig`; calls generic render.
  - **Web adapter**: function or class that accepts (container, data, config); optionally implements a small interface so Power BI visual can use the same “render(data, config)” entry point.
- **Entry points**:
  - Power BI: existing entry (e.g. `src/visual.ts` for Legal Entities) and a second entry for Generic Graph if we ship two visuals.
  - Web: `src/web/generic-graph.ts`, `src/web/legal-entities-graph.ts` (or single export with two names) that expose `createGraph(container, data, options)`.

### Current state

- **Power BI**: one visual (Legal Entities Graph), fake data, Format pane minimal (Explore card).
- **Web**: test page loads the Power BI visual via the same class; no separate “web-only” API yet.

### Proposed structure

```
src/
  graph/                    # Generic graph (no Power BI)
    config.ts               # GraphConfig interface + defaults
    engine.ts               # D3 simulation, zoom, pan, render
    types.ts                # Node, Link, FullGraph types
  visual-legal-entities.ts  # Power BI visual: Legal Entities (uses graph/ + mapping)
  visual-generic.ts         # Power BI visual: Generic Graph (uses graph/ only)
  settings.ts               # Format pane models (shared or per-visual)
  web/
    index.ts                # Web API: createGenericGraph(), createLegalEntitiesGraph()
```

- **Power BI package**: can remain one `.pbiviz` that registers both visuals, or two separate packages (one per visual). Recommendation: start with one package, two visuals; split later if needed.
- **Web build**: separate bundle(s) that import from `graph/` and `web/` and expose a simple API (no `powerbi-visuals-api` in the bundle if not needed for web).

---

## Generic data binding and mapping

A **generic data binding and mapping system** (in `src/graph/`) maps raw JSON or table-shaped input to the normalized graph structure:

- **Input**: `rows` (each row = one link), or explicit `nodes` + `links` arrays. Columns can follow patterns like `node_id`, `node_name`, `node_att1_name`, `att1_value`, `node_att2_name`, `att2_value`, `link_id`, `link_label`, etc.
- **Config**: `DataMappingConfig` describes which fields are node id/label/type, link source/target/id/label/weight, and optional **attribute pairs** (name column + value column) or **attribute columns** (fixed key → column) for nodes and links.
- **Output**: `GraphData` with `MappedNode[]` (id, label?, type?, attributes?) and `MappedLink[]` (source, target, id?, label?, weight?, attributes?).
- **Adapter**: Legal Entities input format `LegalEntitiesGraph` (nodes + links with shares); `legalEntitiesToGraphData(graph)` converts it to `GraphData` for the engine.

See **[DATA_MAPPING.md](DATA_MAPPING.md)** for the full API and examples.

---

## Roadmap

### Phase 1: Extract and generalize (Generic Graph foundation)

- [x] **Data binding and mapping** in `src/graph/`: `MappedNode`, `MappedLink`, `GraphData`, `DataMappingConfig`, `mapInputToGraph()`, row-based and structured mapping, attribute pairs (e.g. node_att1_name, att1_value), `legalEntitiesToGraphData()`, `LegalEntitiesGraph`. See [DATA_MAPPING.md](DATA_MAPPING.md).
- [x] **GraphConfig** in `src/graph/config.ts` with layout, style, behavior params; defaults from current visual.
- [x] **Graph engine** in `src/graph/engine.ts`: simulation, zoom, pan, drag, render from config; no Entity/Shareholder logic.
- [x] **Legal Entities visual** refactored: `src/visual.ts` uses `buildLegalEntitiesGraphData` + `renderGraph` + `DEFAULT_GRAPH_CONFIG`; expand-on-click and share % in adapter/engine.
- [x] Current behavior and UI preserved; Power BI package and test page work.

**Outcome**: One generic graph engine; Legal Entities visual is a thin layer on top.

### Phase 2: Power BI Generic Graph visual

- [x] **Generic Graph** Power BI visual in `src/visual-generic.ts`: data roles Source, Target, Weight; uses `graph/engine` + `DEFAULT_GENERIC_GRAPH_CONFIG`; `capabilities-generic.json`. Registered in test entry for browser testing.
- [ ] Package a second `.pbiviz` for Generic Graph (separate build; one .pbiviz per visual is the standard).
- [ ] Format pane for Generic Graph: map to `GraphConfig` (colors, sizes, distances, etc.).

**Outcome**: Two Power BI visuals (Generic + Legal Entities) sharing one core.

### Phase 3: Web widget API and bundles

- [x] **Web API** in `src/web/index.ts`: `createGenericGraph(container, data, options)`, `createLegalEntitiesGraph(container, data, options)` returning `{ destroy(), updateData(), updateOptions() }`.
- [x] **Web bundle**: `npm run build:web` produces `dist/inventiv-dataviz.js` (IIFE) and `dist/inventiv-dataviz.esm.js` (ESM); no Power BI in bundle.
- [x] Document web usage (script tag + ESM import) in README, GETTING_STARTED, and demo/examples.

**Outcome**: Same visuals usable as Web Widgets and Power BI plugins.

### Phase 4: Polish and documentation

- [ ] Expand Format pane for both visuals (all important config params exposed).
- [x] **Fake data removed from library**: Legal Entities visual reads only from DataView. Demo/fake data lives in `demo/fakeGraphData.ts`; demo entry builds a mock DataView. Production package contains no fake data.
- [ ] Bind Legal Entities visual to **real** Power BI data (From, To, Shares) in reports; empty state when no data.
- [x] E2E tests (Playwright, 18 scenarios: load, expand, Organiser, Fit, layout persistence, info card).
- [x] README and docs: vision, architecture, config reference, web + Power BI usage (see docs/README.md).

---

## Summary

| Target | Deliverable |
|--------|-------------|
| **1. Generic Graph Widget** | Configurable graph engine (colors, style, distances, sizes, content, behavior) with current behavior as defaults; usable in Power BI and web. |
| **2. Legal Entities Widget** | Specialized widget (entities, shareholders, share %) built on the generic widget; reuses same logic and code. |
| **3. Web + Power BI** | Both widgets available as web widgets (API + bundle) and as Power BI packaged plugins (.pbiviz). |

The **design** is: **one generic core** + **two visual surfaces** (Generic + Legal Entities) + **two delivery channels** (Web + Power BI), with a clear roadmap in four phases from extraction to polish.
