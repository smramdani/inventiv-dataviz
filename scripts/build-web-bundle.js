#!/usr/bin/env node
/**
 * Builds the web widget bundle (no Power BI): createGenericGraph, createLegalEntitiesGraph.
 * Output: dist/inventiv-dataviz.js (UMD) and dist/inventiv-dataviz.esm.js (ESM).
 */

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const projectRoot = path.join(__dirname, "..");
const outDir = path.join(projectRoot, "dist");
const entry = path.join(projectRoot, "src", "web", "index.ts");

const lessPlugin = {
  name: "less-stub",
  setup(build) {
    build.onResolve({ filter: /\.less$/ }, () => ({ path: "", namespace: "less-stub" }));
    build.onLoad({ filter: /.*/, namespace: "less-stub" }, () => ({ contents: "export {}", loader: "js" }));
  },
};

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

Promise.all([
  esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: path.join(outDir, "inventiv-dataviz.js"),
    format: "iife",
    globalName: "InventivDataviz",
    platform: "browser",
    target: ["es2020"],
    sourcemap: true,
    plugins: [lessPlugin],
    loader: { ".json": "json" },
  }),
  esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: path.join(outDir, "inventiv-dataviz.esm.js"),
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    sourcemap: true,
    plugins: [lessPlugin],
    loader: { ".json": "json" },
  }),
])
  .then(() => {
    console.log("Web bundle built: dist/inventiv-dataviz.js, dist/inventiv-dataviz.esm.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
