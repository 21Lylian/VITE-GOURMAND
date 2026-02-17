const { test, expect } = require("@playwright/test");

async function assertNoHorizontalOverflow(page) {
  const hasOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(hasOverflow).toBeFalsy();
}

async function login(page, email, password) {
  await page.goto("/connexion.html");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=\"submit\"]");
}

async function createUser(page, stamp) {
  const email = `responsive.${stamp}@test.local`;
  await page.goto("/inscription.html");
  await page.fill("#nom", "Responsive");
  await page.fill("#prenom", "User");
  await page.fill("#gsm", "0600000000");
  await page.fill("#adresse-postale", "1 rue de test, Bordeaux");
  await page.fill("#email", email);
  await page.fill("#password", "MotDePasse!123");
  await page.fill("#password-confirm", "MotDePasse!123");
  await page.click("button[type=\"submit\"]");
  await expect(page).toHaveURL(/index\.html/, { timeout: 7000 });
  return email;
}

test("Smoke responsive espaces (desktop + mobile)", async ({ page }) => {
  const viewports = [
    { width: 1280, height: 800 },
    { width: 390, height: 844 }
  ];

  const stamp = Date.now();

  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.goto("/index.html");
    await page.evaluate(() => localStorage.clear());

    await page.goto("/admin.html");
    await expect(page.locator("h1")).toContainText("Tableau de bord");
    await assertNoHorizontalOverflow(page);

    await login(page, "admin@vite-gourmand.local", "Admin!12345");
    await expect(page).toHaveURL(/espace-admin\.html/, { timeout: 7000 });
    await assertNoHorizontalOverflow(page);

    await page.goto("/espace-employe.html");
    await expect(page.locator("h1")).toContainText("Espace Employe");
    await assertNoHorizontalOverflow(page);

    const userEmail = await createUser(page, `${stamp}-${vp.width}`);
    await login(page, userEmail, "MotDePasse!123");
    await expect(page).toHaveURL(/espace-utilisateur\.html/, { timeout: 7000 });
    await assertNoHorizontalOverflow(page);
  }
});
