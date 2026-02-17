const { test } = require("@playwright/test");

test("debug menus", async ({ page }) => {
  page.on("console", (msg) => console.log("BROWSER:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));
  await page.goto("/menus.html");
  await page.waitForTimeout(2500);
  console.log("URL", page.url());
  const content = await page.content();
  console.log("HAS_LIST", content.includes("id=\"liste-menus\""));
  console.log("HEAD", content.slice(0, 220));
  const count = await page.locator("#liste-menus .menu").count();
  const html = await page.locator("#liste-menus").innerHTML();
  console.log("COUNT", count);
  console.log("INNER", html);
});
