document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-reset-mdp");
  const confirmForm = document.getElementById("form-reset-confirm");
  const confirm = document.getElementById("reset-mdp-confirm");
  const tokenInput = document.getElementById("reset-token");
  const newPasswordInput = document.getElementById("new-password");

  function validatePassword(p) {
    return /(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(p || "");
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    try {
      const result = await window.Api.requestPasswordReset(email);
      form.reset();
      if (result && result.resetToken) {
        tokenInput.value = result.resetToken;
      }
      confirm.textContent = "Demande envoyée. Utilisez le token affiché pour définir un nouveau mot de passe.";
      confirm.style.display = "block";
    } catch (err) {
      confirm.textContent = err.message || "Erreur lors de la demande de réinitialisation.";
      confirm.style.display = "block";
    }
  });

  confirmForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = tokenInput.value.trim();
    const password = newPasswordInput.value;
    if (!validatePassword(password)) {
      confirm.textContent = "Mot de passe invalide : 10 caracteres min, majuscule, minuscule, chiffre, caractere special.";
      confirm.style.display = "block";
      return;
    }
    try {
      await window.Api.confirmPasswordReset({ token, password });
      confirm.textContent = "Mot de passe mis à jour. Vous pouvez vous connecter.";
      confirm.style.display = "block";
      confirmForm.reset();
    } catch (err) {
      confirm.textContent = err.message || "Erreur lors de la mise à jour du mot de passe.";
      confirm.style.display = "block";
    }
  });
});

