# Examples – minimal integration

These examples show how little code you need to embed a graph in any web page.

## Run the examples

1. **Build the web bundle** (from repo root):

   ```bash
   npm install
   npm run build:web
   ```

2. **Serve the project** (from repo root). Browsers need HTTP to load the script:

   ```bash
   npx serve .
   ```

3. Open in the browser:

   - **Generic graph:** [http://localhost:3000/examples/hello-world.html](http://localhost:3000/examples/hello-world.html)  
     (If `serve` uses another port, e.g. 3000 or 5000, use that.)

   - **Legal Entities graph:** [http://localhost:3000/examples/hello-world-legal.html](http://localhost:3000/examples/hello-world-legal.html)

## What each example does

| File | Widget | Data shape |
|------|--------|------------|
| `hello-world.html` | Generic Graph | `{ rows: [{ source, target, weight }] }` |
| `hello-world-legal.html` | Legal Entities Graph | `{ nodes: [{ id, label, type }], links: [{ source, target, shares }] }` |

Both use the **script tag** API: load `dist/inventiv-dataviz.js`, then call `InventivDataviz.createGenericGraph(container, data)` or `InventivDataviz.createLegalEntitiesGraph(container, data)`.

For **ESM** (e.g. React, Vite): use `dist/inventiv-dataviz.esm.js` and import `createGenericGraph` / `createLegalEntitiesGraph`. See the main [README](../README.md#web-usage-esm).
