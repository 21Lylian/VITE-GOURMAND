const { test, expect } = require("@playwright/test");

async function fillPrompt(page, value) {
  const modal = page.locator(".modal-overlay").last();
  await expect(modal).toBeVisible();
  await modal.locator("textarea").fill(value);
  await modal.getByRole("button", { name: "Confirmer" }).click();
}

async function confirmModal(page) {
  const modal = page.locator(".modal-overlay").last();
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Oui" }).click();
}

test("Parcours API front multi-roles", async ({ page }) => {
  const stamp = Date.now();
  const userEmail = `user.${stamp}@test.local`;
  const employeeEmail = `emp.${stamp}@test.local`;

  await page.goto("/index.html");
  await page.evaluate(() => localStorage.clear());

  await page.goto("/menus.html");
  await expect
    .poll(async () => page.locator("#liste-menus .menu").count(), { timeout: 15000 })
    .toBeGreaterThan(0);
  await page.locator("#liste-menus .menu button").first().click();
  await expect(page).toHaveURL(/menu-detail\.html\?id=\d+/);
  await page.click("#btn-commander");
  await expect(page).toHaveURL(/connexion\.html\?next=/);

  await page.goto("/inscription.html");
  await page.fill("#nom", "Test");
  await page.fill("#prenom", "User");
  await page.fill("#gsm", "0600000000");
  await page.fill("#adresse-postale", "1 rue de test, Bordeaux");
  await page.fill("#email", userEmail);
  await page.fill("#password", "MotDePasse!123");
  await page.fill("#password-confirm", "MotDePasse!123");
  await page.click("button[type=\"submit\"]");
  await expect(page).toHaveURL(/index\.html/, { timeout: 7000 });

  await page.goto("/commande.html?id=1");
  await expect(page.locator("#form-commande")).toBeVisible();
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem("auth_session") || "null"));
  expect(session?.token).toBeTruthy();
  const menusResponse = await fetch("http://127.0.0.1:3000/api/menus");
  expect(menusResponse.ok).toBeTruthy();
  const menus = await menusResponse.json();
  const menuDisponible = menus.find((m) => Number(m.stock) > 0);
  expect(menuDisponible).toBeTruthy();
  const createOrderResponse = await fetch("http://127.0.0.1:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`
    },
    body: JSON.stringify({
      menuId: menuDisponible.id,
      nbPersonnes: menuDisponible.nbPersonnes,
      clientNom: "Test",
      clientPrenom: "User",
      clientEmail: userEmail,
      clientGSM: "0600000000",
      adresse: "10 place Pey-Berland",
      ville: "Bordeaux",
      km: 0,
      date: "2030-01-10",
      heure: "12:30"
    })
  });
  expect(createOrderResponse.status).toBe(201);
  await page.goto("/espace-utilisateur.html");
  await expect.poll(async () => page.locator("#table-commandes-utilisateur tbody tr").count()).toBeGreaterThan(0);

  await page.goto("/connexion.html");
  await page.fill("#email", "admin@vite-gourmand.local");
  await page.fill("#password", "Admin!12345");
  await page.click("button[type=\"submit\"]");
  await expect(page).toHaveURL(/espace-admin\.html/, { timeout: 7000 });

  await page.goto("/espace-admin.html");
  await expect(page.locator("h1")).toContainText("Espace Administrateur");
  await page.fill("#email-employe", employeeEmail);
  await page.fill("#mdp-employe", "Employe!1234");
  await page.click("#form-ajout-employe button[type=\"submit\"]");
  await expect(page.locator("#employes-list")).toContainText(employeeEmail);

  await page.goto("/connexion.html");
  await page.fill("#email", employeeEmail);
  await page.fill("#password", "Employe!1234");
  await page.click("button[type=\"submit\"]");
  await expect(page).toHaveURL(/espace-employe\.html/, { timeout: 7000 });

  await page.goto("/espace-employe.html");
  await expect(page.locator("h1")).toContainText("Espace Employe");
  await expect(page.locator("#commandes-employe tr:first-child select")).toBeVisible();
});

