#!/usr/bin/env node
/**
 * Serves the demo app. Auto-builds the demo bundle if demo/dist/visual.js is missing.
 * Run: npm run demo
 * Open: http://localhost:3000
 */

const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const PORT = 3000;
const projectRoot = path.join(__dirname, "..");
const demoDir = path.join(projectRoot, "demo");
const indexHtml = path.join(demoDir, "index.html");
const distDir = path.join(demoDir, "dist");
const bundlePath = path.join(distDir, "visual.js");

function ensureBundle() {
  if (fs.existsSync(bundlePath)) return true;
  console.log("  Demo bundle not found. Running build:demo...");
  const r = spawnSync("node", [path.join(__dirname, "build-demo.js")], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error("  Build failed. Run: npm run build:demo");
    process.exit(1);
  }
  console.log("");
}

ensureBundle();

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname === "/" ? "/index.html" : parsed.pathname;

  if (pathname === "/index.html") {
    fs.readFile(indexHtml, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Could not read demo/index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  if (pathname.startsWith("/dist/")) {
    const name = pathname.replace(/^\/dist\//, "");
    const file = path.join(distDir, name);
    if (!path.resolve(file).startsWith(path.resolve(distDir))) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found. Run: npm run build:demo");
        return;
      }
      const ext = path.extname(file);
      const ct =
        ext === ".js"
          ? "application/javascript"
          : ext === ".map"
            ? "application/json"
            : "application/octet-stream";
      res.writeHead(200, { "Content-Type": ct });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("");
  console.log("  Demo: http://localhost:" + PORT);
  console.log("  Open this URL in your browser.");
  console.log("");
});
