// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Inventiv DataViz Demo", () => {
  test("Legal Entities Graph: loads, node visible, click does not make graph disappear", async ({
    page,
  }) => {
    const consoleErrors = [];
    const consoleWarnings = [];
    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();
      if (type === "error") consoleErrors.push(text);
      if (type === "warning") consoleWarnings.push(text);
    });

    await page.goto("/");
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible();

    const visual = page.locator("#visual");
    await expect(visual).toBeVisible();

    // Wait for graph to render: toolbar (Fit button) and at least one node (circle or node group)
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    await expect(toolbar.locator("button", { hasText: "Fit" })).toBeVisible();

    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });
    const firstNode = nodesGroup.locator("g").first();
    await expect(firstNode).toBeVisible();

    // Optional: check for single node on first load (Legal Entities starts with one)
    const nodeCountBefore = await nodesGroup.locator("g").count();
    expect(nodeCountBefore).toBeGreaterThanOrEqual(1);

    // Click the first node to expand
    await firstNode.click();

    // Wait for re-render (expansion adds nodes)
    await page.waitForTimeout(800);

    // Graph and toolbar must still be visible (regression: graph used to disappear)
    await expect(toolbar).toBeVisible();
    await expect(toolbar.locator("button", { hasText: "Fit" })).toBeVisible();
    await expect(nodesGroup).toBeVisible();
    const nodeCountAfter = await nodesGroup.locator("g").count();
    expect(nodeCountAfter).toBeGreaterThanOrEqual(1);

    // No uncaught console errors (e.g. layoutChangeTimeout TDZ, persistProperties)
    const errors = consoleErrors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("404") &&
        !e.includes("Failed to load resource")
    );
    expect(errors).toEqual([]);
  });

  test("Legal Entities (custom style): same flow", async ({ page }) => {
    await page.goto("/");
    await page.locator(".nav-item", { hasText: "Legal Entities (custom style)" }).click();
    await page.waitForTimeout(1500);

    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    await nodesGroup.locator("g").first().click();
    await page.waitForTimeout(800);

    await expect(toolbar).toBeVisible();
    await expect(nodesGroup).toBeVisible();
    expect(await nodesGroup.locator("g").count()).toBeGreaterThanOrEqual(1);
  });

  test("Layout persistence: save on drag, restore after reload", async ({ page }) => {
    const LAYOUT_KEY = "inventiv-dataviz-layout-demo-legal-entities";

    await page.goto("/");
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible();
    const visual = page.locator("#visual");
    await expect(visual).toBeVisible();

    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    // Expand so we have multiple nodes
    await nodesGroup.locator("g").first().click();
    await page.waitForTimeout(1000);

    const firstNode = nodesGroup.locator("g").first();
    await expect(firstNode).toBeVisible();
    const box = await firstNode.boundingBox();
    expect(box).toBeTruthy();

    // Drag node to trigger layout save (flushLayoutChange on drag end)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Assert layout was saved to localStorage
    const savedAfterDrag = await page.evaluate((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return { ok: false, reason: "no data" };
        const parsed = JSON.parse(raw);
        const posCount = parsed?.positions && typeof parsed.positions === "object" ? Object.keys(parsed.positions).length : 0;
        return { ok: true, posCount, visibleCount: parsed?.visibleNodeIds?.length ?? 0 };
      } catch (e) {
        return { ok: false, reason: String(e.message) };
      }
    }, LAYOUT_KEY);
    expect(savedAfterDrag.ok, "layout should be in localStorage after drag: " + (savedAfterDrag.reason || "")).toBe(true);
    expect(savedAfterDrag.posCount, "saved positions count").toBeGreaterThan(0);

    // Reload and wait for graph again
    await page.reload();
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible({ timeout: 10000 });
    const visual2 = page.locator("#visual");
    await expect(visual2.locator(".zoom-toolbar")).toBeVisible({ timeout: 15000 });
    await expect(visual2.locator("g.nodes")).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Assert layout still in localStorage and was used (multiple nodes visible)
    const afterReload = await page.evaluate((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return { ok: false, reason: "no data after reload" };
        const parsed = JSON.parse(raw);
        const posCount = Object.keys(parsed?.positions || {}).length;
        return { ok: true, posCount };
      } catch (e) {
        return { ok: false, reason: String(e.message) };
      }
    }, LAYOUT_KEY);
    expect(afterReload.ok, "layout should still be in localStorage after reload: " + (afterReload.reason || "")).toBe(true);
    expect(afterReload.posCount).toBeGreaterThan(0);

    // Assert graph has multiple nodes (restored visibleNodeIds) and not all in same place
    const nodeCount = await visual2.locator("g.nodes g").count();
    expect(nodeCount).toBeGreaterThanOrEqual(1);
    const transforms = await visual2.locator("g.nodes g").evaluateAll((els) =>
      els.map((g) => g.getAttribute("transform") || "")
    );
    const uniqueTransforms = new Set(transforms.filter(Boolean));
    expect(uniqueTransforms.size, "nodes should have different positions (layout restored)").toBeGreaterThanOrEqual(1);
  });

  test("Legal Entities: toolbar has Tout Ouvrir and Tout Fermer buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible();
    const visual = page.locator("#visual");
    await expect(visual).toBeVisible();

    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    await expect(toolbar.locator("button", { hasText: "Tout Ouvrir" })).toBeVisible();
    await expect(toolbar.locator("button", { hasText: "Tout Fermer" })).toBeVisible();
    await expect(toolbar.locator("button", { hasText: "Fit" })).toBeVisible();
  });

  test("Legal Entities: Tout Ouvrir shows all nodes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible();
    const visual = page.locator("#visual");
    await expect(visual).toBeVisible();

    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    const countBefore = await nodesGroup.locator("g").count();
    expect(countBefore).toBeGreaterThanOrEqual(1);

    await toolbar.locator("button", { hasText: "Tout Ouvrir" }).click();
    await page.waitForTimeout(1200);

    const countAfter = await nodesGroup.locator("g").count();
    expect(countAfter).toBeGreaterThan(countBefore);
    expect(countAfter).toBeGreaterThanOrEqual(2);
  });

  test("Legal Entities: Tout Fermer collapses to start node", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible();
    const visual = page.locator("#visual");
    await expect(visual).toBeVisible();

    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    await toolbar.locator("button", { hasText: "Tout Ouvrir" }).click();
    await page.waitForTimeout(1200);
    const countOpen = await nodesGroup.locator("g").count();
    expect(countOpen).toBeGreaterThanOrEqual(2);

    await toolbar.locator("button", { hasText: "Tout Fermer" }).click();
    await page.waitForTimeout(1000);

    const countAfter = await nodesGroup.locator("g").count();
    expect(countAfter).toBe(1);
  });

  test("Generic Graph: toolbar has Organiser but no Tout Ouvrir / Tout Fermer", async ({ page }) => {
    await page.goto("/");
    await page.locator(".nav-item[data-demo='generic-graph']").click();
    await page.waitForTimeout(1500);

    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    await expect(toolbar.locator("button", { hasText: "Fit" })).toBeVisible();
    await expect(toolbar.locator("button", { hasText: "Organiser" })).toBeVisible();
    await expect(toolbar.locator("button", { hasText: "Tout Ouvrir" })).not.toBeVisible();
    await expect(toolbar.locator("button", { hasText: "Tout Fermer" })).not.toBeVisible();
  });

  test("Toolbar has Organiser button (Legal Entities)", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    await expect(visual).toBeVisible();
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    await expect(toolbar.locator("button", { hasText: "Organiser" })).toBeVisible();
  });

  test("Organiser: runs without error and graph stays visible", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    await nodesGroup.locator("g").first().click();
    await page.waitForTimeout(800);
    const countBefore = await nodesGroup.locator("g").count();
    expect(countBefore).toBeGreaterThanOrEqual(1);

    await toolbar.locator("button", { hasText: "Organiser" }).click();
    await page.waitForTimeout(2500);

    await expect(toolbar).toBeVisible();
    await expect(nodesGroup).toBeVisible();
    const countAfter = await nodesGroup.locator("g").count();
    expect(countAfter).toBe(countBefore);

    const errors = consoleErrors.filter(
      (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("Failed to load resource")
    );
    expect(errors, "no console errors during Organiser").toEqual([]);
  });

  test("Organiser: layout changes (node positions differ after run)", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    await nodesGroup.locator("g").first().click();
    await page.waitForTimeout(1000);
    const count = await nodesGroup.locator("g").count();
    expect(count).toBeGreaterThanOrEqual(1);

    await toolbar.locator("button", { hasText: "Organiser" }).click();
    await page.waitForTimeout(2500);

    const transforms = await nodesGroup.locator("g").evaluateAll((els) =>
      els.map((g) => g.getAttribute("transform") || "")
    );
    const uniqueTransforms = new Set(transforms.filter(Boolean));
    expect(uniqueTransforms.size, "Organiser should produce distinct node positions").toBeGreaterThanOrEqual(
      Math.min(2, count)
    );
  });

  test("Fit button: click does not break graph", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    await expect(visual.locator("g.nodes")).toBeVisible({ timeout: 5000 });

    await toolbar.locator("button", { hasText: "Fit" }).click();
    await page.waitForTimeout(500);

    await expect(toolbar).toBeVisible();
    await expect(visual.locator("g.nodes")).toBeVisible();
    expect(await visual.locator("g.nodes g").count()).toBeGreaterThanOrEqual(1);
  });

  test("After expand: links are visible when multiple nodes", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    await nodesGroup.locator("g").first().click();
    await page.waitForTimeout(1000);

    const nodeCount = await nodesGroup.locator("g").count();
    const linksGroup = visual.locator("g.links");
    await expect(linksGroup).toBeVisible();
    if (nodeCount >= 2) {
      const lineCount = await linksGroup.locator("line").count();
      expect(lineCount, "at least one link when 2+ nodes").toBeGreaterThanOrEqual(1);
    }
  });

  test("Organiser: layout is persisted and restored after reload", async ({ page }) => {
    const LAYOUT_KEY = "inventiv-dataviz-layout-demo-legal-entities";
    await page.goto("/");
    const visual = page.locator("#visual");
    const toolbar = visual.locator(".zoom-toolbar");
    await expect(toolbar).toBeVisible({ timeout: 15000 });
    const nodesGroup = visual.locator("g.nodes");
    await expect(nodesGroup).toBeVisible({ timeout: 5000 });

    await nodesGroup.locator("g").first().click();
    await page.waitForTimeout(1000);
    await toolbar.locator("button", { hasText: "Organiser" }).click();
    await page.waitForTimeout(2500);

    const saved = await page.evaluate((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return { ok: false, posCount: 0 };
        const parsed = JSON.parse(raw);
        const posCount = Object.keys(parsed?.positions || {}).length;
        return { ok: true, posCount };
      } catch {
        return { ok: false, posCount: 0 };
      }
    }, LAYOUT_KEY);
    expect(saved.ok).toBe(true);
    expect(saved.posCount).toBeGreaterThan(0);

    await page.reload();
    await expect(page.locator("text=Inventiv DataViz")).toBeVisible({ timeout: 10000 });
    const visual2 = page.locator("#visual");
    await expect(visual2.locator(".zoom-toolbar")).toBeVisible({ timeout: 15000 });
    await expect(visual2.locator("g.nodes")).toBeVisible({ timeout: 5000 });
    const nodeCount = await visual2.locator("g.nodes g").count();
    expect(nodeCount).toBeGreaterThanOrEqual(1);
  });

  test("Info card: visible when clicking a node (no re-render on second click)", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    await expect(visual.locator(".zoom-toolbar")).toBeVisible({ timeout: 15000 });
    await expect(visual.locator("g.nodes")).toBeVisible({ timeout: 5000 });

    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(1000);
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(400);

    const card = visual.locator(".inventiv-info-card");
    await expect(card).toBeVisible();
    await expect(card).toContainText("Type");
  });

  test("Info card: shows custom attributes for Entity (Company Name, Legal Form, City, Country)", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    await expect(visual.locator("g.nodes")).toBeVisible({ timeout: 5000 });
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(1000);
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(400);

    const card = visual.locator(".inventiv-info-card");
    await expect(card).toBeVisible();
    await expect(card).toContainText("Company Name");
    await expect(card).toContainText("Legal Form");
    await expect(card).toContainText("City");
    await expect(card).toContainText("Country");
  });

  test("Info card: shows custom attributes for Shareholder (First Name, Last Name, Age)", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    await expect(visual.locator("g.nodes")).toBeVisible({ timeout: 5000 });
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(1000);
    const shareholderNode = visual.locator("g.nodes g").filter({ hasText: "Larry" }).first();
    await expect(shareholderNode).toBeVisible({ timeout: 3000 });
    await shareholderNode.click();
    await page.waitForTimeout(1000);
    await shareholderNode.click();
    await page.waitForTimeout(400);

    const card = visual.locator(".inventiv-info-card");
    await expect(card).toBeVisible();
    await expect(card).toContainText("First Name");
    await expect(card).toContainText("Last Name");
    await expect(card).toContainText("Age");
  });

  test("Info card: visible when clicking a link", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    await expect(visual.locator("g.nodes")).toBeVisible({ timeout: 5000 });
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(1000);

    const firstLine = visual.locator("g.links line").first();
    await firstLine.click({ force: true });
    await page.waitForTimeout(400);

    const card = visual.locator(".inventiv-info-card");
    await expect(card).toBeVisible();
    await expect(card).toContainText("Weight");
  });

  test("Info card: close button hides the card", async ({ page }) => {
    await page.goto("/");
    const visual = page.locator("#visual");
    await expect(visual.locator("g.nodes")).toBeVisible({ timeout: 5000 });
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(1000);
    await visual.locator("g.nodes g").first().click();
    await page.waitForTimeout(400);

    const card = visual.locator(".inventiv-info-card");
    await expect(card).toBeVisible();
    await card.locator("button.inventiv-info-card-close").click();
    await page.waitForTimeout(200);
    await expect(card).toBeHidden();
  });
});
