# Validation SMTP contact (point 6)

Date: 17/02/2026

## 1. Variables .env requises
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASS=...
CONTACT_TO=ton_email@exemple.com
CONTACT_FROM=no-reply@vite-gourmand.local
```

## 2. Lancement
1. `npm.cmd run start:api`
2. `npx http-server . -p 4173 -c-1`
3. Ouvrir `http://127.0.0.1:4173/contact.html`

## 3. Test fonctionnel
1. Remplir le formulaire contact.
2. Soumettre.
3. Resultat attendu:
- API repond 201
- message succes visible cote front
- email visible dans la boite Mailtrap (ou destinataire final selon provider)

## 4. Verification API directe (option)
```bash
curl -X POST http://127.0.0.1:3000/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test\",\"description\":\"Message test\",\"email\":\"client@test.com\"}"
```

Resultat attendu:
- `emailSent: true` si SMTP correctement configure
- `emailSent: false` + `warning` si SMTP incomplet
