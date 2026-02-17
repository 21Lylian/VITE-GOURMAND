document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-connexion");
  const message = document.getElementById("connexion-message");

  function getDefaultRedirectForRole(role) {
    if (role === "admin") return "espace-admin.html";
    if (role === "employe") return "espace-employe.html";
    return "espace-utilisateur.html";
  }

  function showMessage(text, ok) {
    message.textContent = text;
    message.style.display = "block";
    message.style.color = ok ? "green" : "crimson";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const result = await window.Api.login({ email, password });
      window.Api.setSession(result.token, result.user);
      showMessage("Connexion reussie", true);
      form.reset();
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      const roleRedirect = getDefaultRedirectForRole(result.user && result.user.role);
      setTimeout(() => {
        window.location = next || roleRedirect;
      }, 600);
    } catch (err) {
      showMessage(err.message || "Identifiants incorrects", false);
    }
  });
});
