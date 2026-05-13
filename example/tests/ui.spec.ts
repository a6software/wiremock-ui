import { expect, test } from "@playwright/test";

const visibleRouteLocator = ".route-row:not(.hidden) .route-cell code";

const visibleRoutes = async (page) =>
  page.locator(visibleRouteLocator).evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));

const openApp = async (page) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Wiremock Mappings" })).toBeVisible();
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await page.waitForTimeout(1000);
    }
  }
};

test.beforeEach(async ({ page, context, baseURL }) => {
  if (baseURL) {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  }
  await openApp(page);
});

test("renders mappings table in default WireMock order", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Wiremock Mappings" })).toBeVisible();
  await expect(page.getByText("21 visible")).toBeVisible();

  const routes = await visibleRoutes(page);
  expect(routes.slice(0, 4)).toEqual([
    "/demo/users/DEMO_USER",
    "/demo/users/DEMO_USER/activity-report",
    "/directory/users/DEMO_USER/email",
    "/assignmentsapi/users/DEMO_USER/workloads",
  ]);
});

test("route search filters rows and refresh preserves the query", async ({ page }) => {
  await page.getByLabel("Search by route").fill("/directory/users/DEMO_USER/email");
  await expect(page.getByText("1 visible")).toBeVisible();
  await expect(page.locator(".route-row:not(.hidden)")).toHaveCount(1);
  await expect(page.locator(".route-row:not(.hidden) .route-cell code")).toHaveText("/directory/users/DEMO_USER/email");

  const refreshLink = page.getByRole("link", { name: "Refresh" });
  await expect(refreshLink).toHaveAttribute("href", /search=%2Fdirectory%2Fusers%2FDEMO_USER%2Femail/);

  await refreshLink.click();
  await expect(page.getByLabel("Search by route")).toHaveValue("/directory/users/DEMO_USER/email");
  await expect(page.getByText("1 visible")).toBeVisible();
});

test("advanced filters can narrow by method matcher and status", async ({ page }) => {
  await page.locator("#advanced-filters summary").click();

  await page.locator("#method-filters label", { hasText: "POST" }).click();
  await expect(page.getByText("4 visible")).toBeVisible();

  await page.locator("#matcher-filters label", { hasText: "URL Pattern" }).click();
  await expect(page.getByText("2 visible")).toBeVisible();

  await page.locator("#status-filters label", { hasText: "200" }).click();
  await expect(page.getByText("2 visible")).toBeVisible();

  const routes = await visibleRoutes(page);
  expect(routes).toHaveLength(2);
  expect(routes).toEqual(expect.arrayContaining([
    "/verification/token/verify",
    "/auth/oauth/token",
  ]));
});

test("sorting cycles ascending descending and back to default order", async ({ page }) => {
  const before = await visibleRoutes(page);

  await page.locator('.sort-button[data-sort-key="route"]').click();
  const ascending = await visibleRoutes(page);
  expect(ascending[0]).toBe("/assignmentsapi/users/DEMO_USER/workloads");

  await page.locator('.sort-button[data-sort-key="route"]').click();
  const descending = await visibleRoutes(page);
  expect(descending[0]).toBe("/verification/token/verify");

  await page.locator('.sort-button[data-sort-key="route"]').click();
  const reset = await visibleRoutes(page);
  expect(reset).toEqual(before);
});

test("row chevron expands details and header chevron expands all visible rows", async ({ page }) => {
  await expect(page.locator(".route-detail-row.hidden")).toHaveCount(21);

  await page.locator(".route-row .expand-toggle").first().click();
  await expect(page.locator(".route-detail-row.hidden")).toHaveCount(20);
  await expect(page.locator(".route-detail-row:not(.hidden)").first().getByText("Mapping ID")).toBeVisible();

  await page.getByRole("button", { name: "Expand all rows" }).click();
  await expect(page.locator(".route-detail-row.hidden")).toHaveCount(0);

  await page.getByRole("button", { name: "Collapse all rows" }).click();
  await expect(page.locator(".route-detail-row.hidden")).toHaveCount(21);
});

test("large response payload is truncated with full payload available", async ({ page }) => {
  await page.getByLabel("Search by route").fill("/demo/users/DEMO_USER/activity-report");
  await expect(page.getByText("1 visible")).toBeVisible();

  const routeRow = page.locator(".route-row:not(.hidden)").filter({
    has: page.locator(".route-cell code", { hasText: "/demo/users/DEMO_USER/activity-report" }),
  });
  await expect(routeRow).toHaveCount(1);
  await routeRow.locator(".expand-toggle").click();

  const detailRow = page.locator(".route-detail-row:not(.hidden)");
  const payloadBody = detailRow.locator(".payload-body");
  const payloadToggle = detailRow.getByRole("button", { name: "Show full payload" });

  await expect(payloadBody).toHaveCount(1);
  await expect(payloadBody).toBeVisible();
  await expect(payloadBody).toHaveText(/\.{3}$/);
  await expect(payloadBody).not.toContainText("notification-service");
  await expect(detailRow.getByText("Show truncated payload")).toHaveCount(0);

  await payloadToggle.click();
  await expect(payloadBody).toHaveCount(1);
  await expect(payloadBody).toContainText("notification-service");
  await expect(payloadBody).toContainText("larger than eight hundred characters");
  await expect(payloadBody).not.toHaveText(/\.{3}$/);
  await expect(detailRow.getByRole("button", { name: "Show truncated payload" })).toHaveAttribute("aria-expanded", "true");
  await expect(detailRow.getByText("Show full payload")).toHaveCount(0);

  await detailRow.getByRole("button", { name: "Show truncated payload" }).click();
  await expect(payloadBody).toHaveCount(1);
  await expect(payloadBody).toHaveText(/\.{3}$/);
  await expect(payloadBody).not.toContainText("notification-service");
  await expect(detailRow.getByRole("button", { name: "Show full payload" })).toHaveAttribute("aria-expanded", "false");
  await expect(detailRow.getByText("Show truncated payload")).toHaveCount(0);
});

test("copy route button writes the route to the clipboard", async ({ page }) => {
  await page.locator(".copy-route-button").first().click();

  await expect(page.locator(".copy-route-button").first()).toHaveClass(/copied/);
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("/demo/users/DEMO_USER");
});
