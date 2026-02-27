# Inventiv DataViz

**Graph widgets for the web and Power BI.** Drop a graph into any page or report with a single script and one function call.

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

More options and data shapes: [docs/DATA_MAPPING.md](docs/DATA_MAPPING.md), [docs/VISION_AND_ROADMAP.md](docs/VISION_AND_ROADMAP.md).

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
```

---

## Docs

- **Getting started:** [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) (step-by-step) and [examples/README.md](examples/README.md) (minimal examples).
- **Data shapes and mapping:** [docs/DATA_MAPPING.md](docs/DATA_MAPPING.md).
- **Vision, design, roadmap:** [docs/VISION_AND_ROADMAP.md](docs/VISION_AND_ROADMAP.md).
