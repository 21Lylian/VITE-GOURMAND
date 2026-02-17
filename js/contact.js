document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-contact");
  const confirmation = document.getElementById("confirmation");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const titre = document.getElementById("titre").value.trim();
    const description = document.getElementById("description").value.trim();
    const email = document.getElementById("email").value.trim();

    try {
      await window.Api.sendContact({ title: titre, description, email });
      form.reset();
      confirmation.textContent = "Votre message a bien ete envoye !";
      confirmation.style.display = "block";
      setTimeout(() => {
        confirmation.style.display = "none";
      }, 3500);
    } catch (err) {
      confirmation.textContent = err.message || "Erreur lors de l'envoi du message.";
      confirmation.style.display = "block";
    }
  });
});

