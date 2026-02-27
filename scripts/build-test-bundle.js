#!/usr/bin/env node
/**
 * Builds a standalone test bundle (API + visual) for browser testing.
 * No dev server or proxy needed - the test page loads this bundle directly.
 */

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const projectRoot = path.join(__dirname, "..");
const outDir = path.join(projectRoot, "test", "dist");
const entry = path.join(projectRoot, "test", "entry.ts");

// Stub .less imports (styles are optional for test)
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
    globalName: "InventivDatavizTest",
    platform: "browser",
    target: ["es2020"],
    sourcemap: true,
    plugins: [lessPlugin],
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    loader: {
      ".json": "json",
    },
  })
  .then(() => {
    console.log("Test bundle built: test/dist/visual.js");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
