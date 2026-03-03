# Inventiv DataViz

**A small collection of graph widgets that are actually easy to use.**

---

## ▶ Live demo (no install)

Try the widgets in your browser — no clone, no build, no deploy, life test :

**[▶ Open live demo](https://smramdani.github.io/inventiv-dataviz/)**

*If the link above doesn’t load yet, the demo just needs to be published once (see below).*

---

### Publish the demo online (one-time setup)

So that users can open the demo without installing anything:

1. On GitHub, open your repo: **https://github.com/smramdani/inventiv-dataviz**
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Save. The [workflow](.github/workflows/deploy-demo.yml) will run (on the next push to `main`/`master`, or trigger it manually from the **Actions** tab). When it finishes, the demo is live at **https://smramdani.github.io/inventiv-dataviz/**.

---

## What is this?

**Inventiv DataViz** is a set of **ready‑to‑drop graph visuals** for the web and for Power BI. No heavy framework, no “first configure 47 things” — you get **interactive node‑and‑link graphs** (zoom, pan, drag, click‑to‑expand) with minimal setup.

Think of it as: *“I need a graph on this page / in this report. Give me one div, one script, one function call.”* That’s the idea.

- **For the web:** Use a single script tag (or an ESM import) and call `createGenericGraph()` or `createLegalEntitiesGraph()`. Your data is plain JSON (nodes, links, or simple rows). Works in any HTML page, React, Vue, or dashboard.
- **For Power BI:** Import the `.pbiviz` file once, drag the visual onto the report, and bind your fields. No code in the report.

You get **two widgets** (for now): a **Generic Graph** for any network (anything with nodes and connections), and a **Legal Entities Graph** for company structures (entities, shareholders, ownership %). Both share the same engine, so they behave the same way and stay lightweight.

**TL;DR:** Useful, easy‑to‑use dataviz widgets. Web + Power BI. One container, one call. Then you can customize colors, shapes, and data as much as you like.

### Widgets available today

- **Generic Graph** — Any network: nodes and links, with optional weights and labels. Customize colors, shapes (circle, rect, triangle…), and layout. Ideal for org charts, dependency graphs, taxonomies, or any “things connected to things”.
- **Legal Entities Graph** — Built for corporate structures: legal entities, shareholders, and ownership. Click a node to expand and see who owns what; share % on edges. Same engine as the generic one, with semantics tuned for entities and shareholders.

**More widgets are on the roadmap.** If you need a **specific widget** or a **particular dataviz** (custom chart, diagram, or visual), get in touch with the project team — they’ll be happy to discuss and implement it.

**License:** [GNU AGPL v3.0](https://www.gnu.org/licenses/agpl-3.0.html)

---

## Quick start (web – about 30 seconds)

1. **Get the bundle**

   ```bash
   git clone <this-repo>
   cd inventiv-dataviz
   npm install
   npm run build:web
   ```

   This produces `dist/inventiv-dataviz.js` (and `dist/inventiv-dataviz.esm.js` for ESM).

2. **Add one container and one script to your page**

   ```html
   <div id="graph" style="width:100%; height:400px;"></div>
   <script src="path/to/inventiv-dataviz.js"></script>
   <script>
     var data = { rows: [
       { source: "A", target: "B", weight: 10 },
       { source: "B", target: "C", weight: 20 }
     ]};
     InventivDataviz.createGenericGraph(document.getElementById("graph"), data);
   </script>
   ```

   That’s it. You get an interactive graph (zoom, pan, drag).

3. **Try the full hello-world examples**

   ```bash
   npx serve .
   ```

   Then open:

   - **Generic graph:** [http://localhost:3000/examples/hello-world.html](http://localhost:3000/examples/hello-world.html)
   - **Legal Entities graph:** [http://localhost:3000/examples/hello-world-legal.html](http://localhost:3000/examples/hello-world-legal.html)

   See [examples/README.md](examples/README.md) for details.

---

## Hello World – two widgets, same idea

### 1. Generic Graph (any nodes and links)

Minimal data: an array of **rows** with `source`, `target`, and optional `weight`.

```html
<div id="graph" style="width:100%; height:400px;"></div>
<script src="dist/inventiv-dataviz.js"></script>
<script>
  InventivDataviz.createGenericGraph(document.getElementById("graph"), {
    rows: [
      { source: "A", target: "B", weight: 10 },
      { source: "B", target: "C", weight: 20 },
      { source: "A", target: "C", weight: 5 }
    ]
  });
</script>
```

### 2. Legal Entities Graph (entities + shareholders, expand on click)

Data: **nodes** (id, label, type: `"Entity"` or `"Shareholder"`) and **links** (source, target, shares).

```html
<div id="graph" style="width:100%; height:400px;"></div>
<script src="dist/inventiv-dataviz.js"></script>
<script>
  InventivDataviz.createLegalEntitiesGraph(document.getElementById("graph"), {
    nodes: [
      { id: "1", label: "Parent Co", type: "Entity" },
      { id: "2", label: "Subsidiary A", type: "Entity" },
      { id: "3", label: "Alice", type: "Shareholder" }
    ],
    links: [
      { source: "3", target: "1", shares: 500 },
      { source: "1", target: "2", shares: 1000 }
    ]
  });
</script>
```

Click a node to expand and see connections. Zoom and pan with the toolbar or mouse.

---

## Richer usage

### Web – script tag (no build)

- Load `dist/inventiv-dataviz.js`; the API is on `window.InventivDataviz`.
- **Generic:** `InventivDataviz.createGenericGraph(container, data, options?)`
- **Legal Entities:** `InventivDataviz.createLegalEntitiesGraph(container, data, options?)`
- Both return a **handle** with `destroy()` and `updateData(newData)`.

### Web – ESM (Vite, React, etc.)

```bash
npm run build:web
```

Then:

```js
import { createGenericGraph, createLegalEntitiesGraph } from "./dist/inventiv-dataviz.esm.js";

const handle = createGenericGraph(containerEl, { rows: [...] });
// or
const handle = createLegalEntitiesGraph(containerEl, { nodes: [...], links: [...] });
```

You can copy the built files into your app’s `public/` or serve them from your own build.

### Options (customize look and behavior)

Pass a third argument to override defaults:

```js
// Generic: custom colors, node size
InventivDataviz.createGenericGraph(container, data, {
  config: {
    nodeRadiusDefault: 20,
    linkStroke: "#0d9488",
    nodeFillOpenDefault: "#3b82f6"
  }
});

// Legal Entities: custom palette, start node
InventivDataviz.createLegalEntitiesGraph(container, data, {
  defaultStartNodeId: "2",
  config: {
    nodeFillOpenByType: { Entity: "#7c3aed", Shareholder: "#059669" }
  }
});
```

Edge width and arrow size scale with each link’s **weight** (min/max in config). Map your numeric column (e.g. shares, volume) via `linkWeightField` in the mapping — see [docs/DATA_MAPPING.md](docs/DATA_MAPPING.md). **Full customization guide** (shapes, colors, sizes, labels, examples): [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).

**Layout persistence:** Positions, zoom and (for Legal Entities) which nodes are opened are saved on drag end and zoom end, and restored on load. On the web, pass `layoutKey: "my-graph"` (a stable id, not derived from node IDs) to save/restore in `localStorage`; when data changes (nodes added/removed), existing nodes keep their positions and new nodes get default placement. Use `onLayoutChange(state)` and `initialLayoutState` for custom storage. In Power BI, layout is persisted with the report. See [docs/LAYOUT_PERSISTENCE_PLAN.md](docs/LAYOUT_PERSISTENCE_PLAN.md).

### Power BI (one-time import)

1. Build the package: `npm run package`
2. In Power BI Desktop: **…** in the Visualizations pane → **Import a visual from a file**
3. Select `dist/inventivLegalEntitiesGraph.1.0.0.0.pbiviz`
4. Add the **Legal Entities Graph** visual to the report and bind **From**, **To**, and **Number of Shares**

No npm or code in your report – just import the file and bind fields.

### Live demo (all scenarios)

To try every widget and style in the browser:

```bash
npm run build:demo
npm run demo
```

Open **http://localhost:3000** for the full demo (Legal Entities, Generic, Species, Sentence, custom styles). See [demo/README.md](demo/README.md).

---

## What’s in the box

| Widget | Use case | Web API | Power BI |
|--------|----------|---------|----------|
| **Generic Graph** | Any network (nodes + links). Customizable colors, shapes, layout. | `createGenericGraph(container, data, options?)` | (in repo) |
| **Legal Entities Graph** | Entities, shareholders, ownership %. Expand on click, share % on edges. | `createLegalEntitiesGraph(container, data, options?)` | ✅ `.pbiviz` |

Both widgets share the same engine (zoom, pan, drag, layout). Data is plain objects (rows or nodes+links); no Power BI dependency in the web build.

---

## Project layout

| Path | Purpose |
|------|---------|
| **dist/** | Built files: `inventiv-dataviz.js`, `.esm.js`, and `inventivLegalEntitiesGraph.*.pbiviz` |
| **examples/** | Minimal “hello world” HTML ([examples/README.md](examples/README.md)) |
| **demo/** | Full demo app – run with `npm run demo` ([demo/README.md](demo/README.md)) |
| **docs/** | [VISION_AND_ROADMAP.md](docs/VISION_AND_ROADMAP.md), [DATA_MAPPING.md](docs/DATA_MAPPING.md) |
| **src/** | Graph engine, visuals, web API |

## Build commands

```bash
npm install
npm run build:web    # Web bundle (dist/inventiv-dataviz.js, .esm.js)
npm run build:demo   # Demo app bundle (demo/dist/visual.js)
npm run demo         # Serve demo at http://localhost:3000
npm run package      # Power BI .pbiviz (dist/inventivLegalEntitiesGraph.*.pbiviz)
npm run test:e2e     # Automated E2E: build demo, start server, run Playwright tests (graph load + click, no disappear)
```

**Tests :** les tests automatisés (E2E Playwright) sont dans **[tests/](tests/)**. Un seul dossier `tests/` ; la config est `playwright.config.js` à la racine. Les dossiers `test-results/` et `playwright-report/` sont générés à l’exécution (ignorés par Git).

---

## Docs

- **Getting started:** [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) (step-by-step) and [examples/README.md](examples/README.md) (minimal examples).
- **Customization (shapes, colors, sizes, examples):** [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).
- **Data shapes and mapping:** [docs/DATA_MAPPING.md](docs/DATA_MAPPING.md).
- **Vision, design, roadmap:** [docs/VISION_AND_ROADMAP.md](docs/VISION_AND_ROADMAP.md).
- **Layout persistence:** [docs/LAYOUT_PERSISTENCE_PLAN.md](docs/LAYOUT_PERSISTENCE_PLAN.md) — save/restore positions and zoom on drag/zoom end; `layoutKey` per graph; partial restore when data changes.
