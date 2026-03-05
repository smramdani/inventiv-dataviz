#!/usr/bin/env node
/**
 * Builds the demo bundle (widgets + demo data) for the demo app.
 * Output: demo/dist/visual.js
 */

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const projectRoot = path.join(__dirname, "..");
const outDir = path.join(projectRoot, "demo", "dist");
const entry = path.join(projectRoot, "demo", "entry.ts");
const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));

const lessPlugin = {
  name: "less-stub",
  setup(build) {
    build.onResolve({ filter: /\.less$/ }, () => ({
      path: path.join(projectRoot, "style", "visual.less"),
      namespace: "less-stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "less-stub" }, () => ({
      contents: "export {}",
      loader: "js",
    }));
  },
};

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

esbuild
  .build({
    entryPoints: [entry],
    bundle: true,
    outfile: path.join(outDir, "visual.js"),
    format: "iife",
    globalName: "InventivDatavizDemo",
    platform: "browser",
    target: ["es2020"],
    sourcemap: true,
    plugins: [lessPlugin],
    define: {
      "process.env.NODE_ENV": '"development"',
      "INVENTIV_DATAVIZ_VERSION": JSON.stringify(pkg.version),
    },
    loader: { ".json": "json" },
  })
  .then(() => {
    console.log("Demo bundle built: demo/dist/visual.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
