document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-inscription");
  const msg = document.getElementById("inscription-message");
  if (!form || !msg) {
    // eslint-disable-next-line no-console
    console.error("Formulaire d'inscription introuvable.");
    return;
  }

  function validatePassword(p) {
    return /(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(p);
  }

  function showMessage(text, ok) {
    msg.textContent = text;
    msg.style.display = "block";
    msg.style.color = ok ? "green" : "crimson";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const gsm = document.getElementById("gsm").value.trim();
    const adresse = document.getElementById("adresse-postale").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const conf = document.getElementById("password-confirm").value;

    if (password !== conf) {
      showMessage("Les mots de passe ne correspondent pas.", false);
      return;
    }
    if (!validatePassword(password)) {
      showMessage("Mot de passe invalide : au moins 10 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.", false);
      return;
    }

    try {
      showMessage("Creation du compte en cours...", true);
      await window.Api.register({ nom, prenom, gsm, adresse, email, password });
      const login = await window.Api.login({ email, password });
      window.Api.setSession(login.token, login.user);
      showMessage(`Inscription reussie !`, true);
      setTimeout(() => {
        window.location = "index.html";
      }, 900);
    } catch (err) {
      const text = err && err.message ? err.message : "Erreur d'inscription.";
      showMessage(text, false);
      // Fallback visuel si le bloc message n'est pas percu.
      if (String(text).toLowerCase().includes("fetch")) {
        alert("Impossible de contacter l'API. Verifiez que le serveur backend est demarre sur http://localhost:3000.");
      }
    }
  });
});
