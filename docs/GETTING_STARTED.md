# Getting started with Inventiv DataViz

Integrate a graph into your app in three steps: **install**, **build** (or copy the bundle), **call the API**.

---

## 1. Install and build

```bash
git clone <repo-url>
cd inventiv-dataviz
npm install
npm run build:web
```

You now have:

- `dist/inventiv-dataviz.js` – use with a `<script>` tag in any HTML page
- `dist/inventiv-dataviz.esm.js` – use with `import` in a bundler (Vite, Webpack, etc.)

---

## 2. Web – simplest case (script tag)

In your HTML:

1. A **container** (e.g. a `div` with an id).
2. A **script** that loads the bundle.
3. One **function call** with your data.

**Generic graph:**

```html
<div id="graph" style="width:100%; height:400px;"></div>
<script src="path/to/inventiv-dataviz.js"></script>
<script>
  InventivDataviz.createGenericGraph(document.getElementById("graph"), {
    rows: [
      { source: "A", target: "B", weight: 10 },
      { source: "B", target: "C", weight: 20 }
    ]
  });
</script>
```

**Legal Entities graph:**

```html
<div id="graph" style="width:100%; height:400px;"></div>
<script src="path/to/inventiv-dataviz.js"></script>
<script>
  InventivDataviz.createLegalEntitiesGraph(document.getElementById("graph"), {
    nodes: [
      { id: "1", label: "Company", type: "Entity" },
      { id: "2", label: "Owner", type: "Shareholder" }
    ],
    links: [
      { source: "2", target: "1", shares: 1000 }
    ]
  });
</script>
```

Serve the page over HTTP (e.g. `npx serve .` in the project root) so the script loads. Open [examples/hello-world.html](../examples/hello-world.html) and [examples/hello-world-legal.html](../examples/hello-world-legal.html) for runnable versions.

---

## 3. Richer cases

- **Custom colors, shapes, sizes:** pass a third argument `{ config: { ... } }`. Full reference and examples: [CUSTOMIZATION.md](CUSTOMIZATION.md).
- **Layout persistence:** pass `layoutKey: "my-graph"` (stable id, not from node IDs) so positions and zoom are saved in localStorage on drag/zoom end and restored on load; when data changes, existing nodes keep positions and new nodes get default placement. See [LAYOUT_PERSISTENCE_PLAN.md](LAYOUT_PERSISTENCE_PLAN.md).
- **Update data later:** the API returns a handle; call `handle.updateData(newData)`.
- **ESM / bundler:** import from `inventiv-dataviz.esm.js` – see [README – Web usage ESM](../README.md#web---esm-vite-react-etc).
- **Power BI:** run `npm run package`, then in Power BI Desktop import `dist/inventivLegalEntitiesGraph.*.pbiviz`. See [README – Power BI](../README.md#power-bi-one-time-import).
- **Full demo:** run `npm run demo` and open http://localhost:3000 – multiple widgets and themes.

---

## Where to go next

- **Customization (shapes, colors, sizes, code examples):** [CUSTOMIZATION.md](CUSTOMIZATION.md)
- **Minimal examples:** [examples/README.md](../examples/README.md)
- **Data shapes and mapping:** [DATA_MAPPING.md](DATA_MAPPING.md)
- **Vision and roadmap:** [VISION_AND_ROADMAP.md](VISION_AND_ROADMAP.md)
