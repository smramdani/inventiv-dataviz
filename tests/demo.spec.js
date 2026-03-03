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
});
