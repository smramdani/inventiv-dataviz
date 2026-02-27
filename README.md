# Inventiv DataViz – Multi-widget Power BI custom visuals

**License:** [GNU AGPL v3.0](https://www.gnu.org/licenses/agpl-3.0.html) – open source; network use of modified versions requires sharing source.

A collection of **Power BI custom visuals** under the **Inventiv** project. Each widget can be built and imported into Power BI (or tested in the browser).

## Widgets

| Widget | Description |
|--------|-------------|
| **Legal Entities Graph** | Graph of Legal Entities and Shareholders. Explore by opening nodes to reveal connections. Zoom, pan, share % on edges. |

More widgets will be added over time.

## Build & package

```bash
npm install
npm run package
```

The packaged visual is written to:

`dist/inventivLegalEntitiesGraph.1.0.0.0.pbiviz`

## Use in Power BI

1. Open **Power BI Desktop** (or Power BI Service).
2. In a report, go to **…** (More options) in the Visualizations pane → **Import a visual from a file**.
3. Select `dist/inventivLegalEntitiesGraph.1.0.0.0.pbiviz`.
4. The **Legal Entities Graph** visual appears in the pane. Drag it onto the report.
5. The current build uses **built-in fake data**; no dataset fields are required. Click the starting node, then keep clicking nodes to explore.

## Test locally (browser)

Run the visual in the browser with fake data, without Power BI:

1. Start the local test server (it will build the test bundle if needed):
   ```bash
   npm run test:local
   ```

2. Open **http://localhost:3000** in your browser.  
   The graph appears; click nodes to explore, use the toolbar for zoom and Fit.

If you change the visual code, run `npm run build:test` then refresh the page (or restart `npm run test:local`).

## Development

```bash
npm run build:test # Build standalone test bundle (test/dist/visual.js)
npm run test:local # Serves test page at http://localhost:3000 (auto-builds if needed)
npm run start      # Power BI dev server (for packaging)
npm run lint       # Lint
```

## Project layout

- `src/visual.ts` – Legal Entities Graph visual (D3, expand-on-click, zoom, pan).
- `src/fakeGraphData.ts` – Fake graph data (nodes, links, share %).
- `src/settings.ts` – Format pane model.
- `style/visual.less` – Styles.
- `capabilities.json` – Data roles (From, To, Shares).
- `pbiviz.json` – Visual metadata (current widget: Legal Entities Graph).

Future widgets will be added as additional visuals in this repo or as separate packages.

## Next steps

- Bind Legal Entities Graph to Power BI data (From, To, Number of Shares).
- Add more widgets to the Inventiv DataViz collection.
