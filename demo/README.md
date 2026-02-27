# Inventiv DataViz – Demo

This folder is the **demo and test app** for the Inventiv DataViz widgets library. It is separate from the production and delivery packages (`dist/*.pbiviz`, `dist/inventiv-dataviz.js`).

## What’s in this folder

- **`index.html`** – Demo page with a menu: Legal Entities (tech/conglomerate), Legal Entities (custom style), Generic Graph, Generic Graph (custom style), Species & taxonomy, Sentence / POS.
- **`entry.ts`** – Bundle entry: registers the visuals and injects demo data.
- **`fakeGraphData.ts`** – Demo-only data: anonymized Legal Entities graph; tech/conglomerate graph (~30 nodes: Alphabet, Meta, Tesla, SpaceX, etc.); species/taxonomy (animals, subspecies, relations); sentence/POS (words and grammatical relations).
- **`mockDataView.ts`** – Builds a mock Power BI DataView for the demo.
- **`dist/`** – Built demo bundle (created by `npm run build:demo`).

## How to run the demo

From the **repository root**:

```bash
npm install
npm run build:demo   # Build the demo bundle (demo/dist/visual.js)
npm run demo        # Serve the demo at http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

You can also open `demo/index.html` directly in a browser after running `npm run build:demo`, but some features work best when the page is served over HTTP (e.g. to avoid CORS with file://).

## GitHub Pages

To publish the demo so it’s visible from the GitHub repo page:

1. In the repo: **Settings → Pages**.
2. Under “Build and deployment”, set **Source** to “Deploy from a branch”.
3. Choose a branch (e.g. `main`) and set the folder to **`/ (root)`** or to a folder that contains the built demo (e.g. copy `demo/` contents including `dist/` to `docs/` and set “Deploy from branch” → `docs/`).

Alternatively, use a GitHub Actions workflow that runs `npm run build:demo` and deploys the `demo/` folder (including `demo/dist/`) to the `gh-pages` branch. The site will be available at `https://<org>.github.io/<repo>/`.

## Back to main docs

See the [main README](../README.md) for the library overview, build commands, and Power BI usage.
